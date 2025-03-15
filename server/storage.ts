import { drizzle } from 'drizzle-orm/neon-serverless';
import { eq, and, desc } from 'drizzle-orm';
import { db } from './db';
import { User, Chicken, Resource, Transaction, Price, InsertUser, UserProfile, InsertUserProfile } from "@shared/schema";
import { users, chickens, resources, transactions, prices, userProfiles } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { randomBytes } from "crypto";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  sessionStore: session.Store;

  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBalance(userId: number, amount: number): Promise<void>;
  getUserByReferralCode(referralCode: string): Promise<User | undefined>;

  // Chicken operations
  getChickensByUserId(userId: number): Promise<Chicken[]>;
  createChicken(userId: number, type: string): Promise<Chicken>;
  updateChickenHatchTime(chickenId: number): Promise<void>;

  // Resource operations
  getResourcesByUserId(userId: number): Promise<Resource>;
  updateResources(userId: number, updates: Partial<Resource>): Promise<Resource>;

  // Transaction operations
  createTransaction(
    userId: number,
    type: string,
    amount: number,
    transactionId?: string,
    referralCommission?: number,
    bankDetails?: string
  ): Promise<Transaction>;
  getTransactionsByUserId(userId: number): Promise<Transaction[]>;
  updateTransactionStatus(transactionId: string, status: string): Promise<void>;

  // Price operations
  getPrices(): Promise<Price[]>;
  updatePrice(itemType: string, price: number): Promise<void>;

  // User Profile operations
  getUserProfile(userId: number): Promise<UserProfile | undefined>;
  createUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  updateUserProfile(userId: number, updates: Partial<InsertUserProfile>): Promise<UserProfile>;

  // Admin methods
  getTransactions(): Promise<Transaction[]>;
  getTransactionByTransactionId(transactionId: string): Promise<Transaction | undefined>;
  updatePaymentAddress(address: string): Promise<void>;
  updateWithdrawalTax(percentage: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  public sessionStore: session.Store;
  private paymentAddress: string;
  private withdrawalTax: number;

  constructor() {
    this.sessionStore = new MemoryStore({ checkPeriod: 86400000 });
    this.paymentAddress = "TRX8nHHo2Jd7H9ZwKhh6h8h";
    this.withdrawalTax = 5; // 5% default tax
    this.initializeDefaults();
  }

  private async initializeDefaults() {
    await this.initializePrices();
    await this.initializeAdminUser();
  }

  private async initializeAdminUser() {
    const adminExists = await this.getUserByUsername("adminraja");
    if (!adminExists) {
      await db.insert(users).values({
        username: "adminraja",
        password: "admin8751",
        usdtBalance: "0",
        referralCode: "ADMIN",
        isAdmin: true
      });

      const [admin] = await db.select().from(users).where(eq(users.username, "adminraja"));

      await db.insert(resources).values({
        userId: admin.id,
        waterBuckets: 0,
        wheatBags: 0,
        eggs: 0
      });
    }
  }

  private async initializePrices() {
    const defaultPrices = [
      { itemType: "baby_chicken", price: "90" },
      { itemType: "regular_chicken", price: "150" },
      { itemType: "golden_chicken", price: "400" },
      { itemType: "water_bucket", price: "0.5" },
      { itemType: "wheat_bag", price: "0.5" },
      { itemType: "egg", price: "0.1" }
    ];

    for (const price of defaultPrices) {
      const [existing] = await db.select().from(prices).where(eq(prices.itemType, price.itemType));
      if (!existing) {
        await db.insert(prices).values(price);
      }
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByReferralCode(referralCode: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.referralCode, referralCode));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const referralCode = randomBytes(4).toString('hex');
    const [user] = await db.insert(users).values({
      ...insertUser,
      usdtBalance: "0",
      referralCode,
      isAdmin: false
    }).returning();

    await db.insert(resources).values({
      userId: user.id,
      waterBuckets: 0,
      wheatBags: 0,
      eggs: 0
    });

    return user;
  }

  async updateUserBalance(userId: number, amount: number): Promise<void> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) throw new Error("User not found");

    const newBalance = parseFloat(user.usdtBalance) + amount;
    if (newBalance < 0) throw new Error("Insufficient USDT balance");

    await db.update(users)
      .set({ usdtBalance: newBalance.toFixed(2) })
      .where(eq(users.id, userId));
  }

  async getChickensByUserId(userId: number): Promise<Chicken[]> {
    return db.select().from(chickens).where(eq(chickens.userId, userId));
  }

  async createChicken(userId: number, type: string): Promise<Chicken> {
    const [chicken] = await db.insert(chickens)
      .values({ userId, type })
      .returning();
    return chicken;
  }

  async updateChickenHatchTime(chickenId: number): Promise<void> {
    await db.update(chickens)
      .set({ lastHatchTime: new Date() })
      .where(eq(chickens.id, chickenId));
  }

  async getResourcesByUserId(userId: number): Promise<Resource> {
    const [resource] = await db.select().from(resources).where(eq(resources.userId, userId));
    if (!resource) throw new Error("Resources not found");
    return resource;
  }

  async updateResources(userId: number, updates: Partial<Resource>): Promise<Resource> {
    const [updated] = await db.update(resources)
      .set(updates)
      .where(eq(resources.userId, userId))
      .returning();
    return updated;
  }

  async createTransaction(
    userId: number,
    type: string,
    amount: number,
    transactionId?: string,
    referralCommission?: number,
    bankDetails?: string
  ): Promise<Transaction> {
    const [transaction] = await db.insert(transactions)
      .values({
        userId,
        type,
        amount: amount.toString(),
        status: "pending",
        transactionId: transactionId || randomBytes(16).toString('hex'),
        referralCommission: referralCommission?.toString(),
        bankDetails
      })
      .returning();
    return transaction;
  }

  async getTransactionsByUserId(userId: number): Promise<Transaction[]> {
    return db.select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt));
  }

  async updateTransactionStatus(transactionId: string, status: string): Promise<void> {
    await db.update(transactions)
      .set({ status })
      .where(eq(transactions.transactionId, transactionId));
  }

  async getPrices(): Promise<Price[]> {
    return db.select().from(prices);
  }

  async updatePrice(itemType: string, price: number): Promise<void> {
    await db.update(prices)
      .set({ price: price.toString() })
      .where(eq(prices.itemType, itemType));
  }

  async getTransactions(): Promise<Transaction[]> {
    return db.select()
      .from(transactions)
      .orderBy(desc(transactions.createdAt));
  }

  async getTransactionByTransactionId(transactionId: string): Promise<Transaction | undefined> {
    const [transaction] = await db.select()
      .from(transactions)
      .where(eq(transactions.transactionId, transactionId));
    return transaction;
  }

  async updatePaymentAddress(address: string): Promise<void> {
    this.paymentAddress = address;
  }

  async updateWithdrawalTax(percentage: number): Promise<void> {
    this.withdrawalTax = percentage;
  }

  async getUserProfile(userId: number): Promise<UserProfile | undefined> {
    const [profile] = await db.select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId));
    return profile;
  }

  async createUserProfile(profile: InsertUserProfile): Promise<UserProfile> {
    const [newProfile] = await db.insert(userProfiles)
      .values({
        ...profile,
        avatarColor: profile.avatarColor || "#6366F1",
        avatarStyle: profile.avatarStyle || "default",
        farmBackground: profile.farmBackground || "default"
      })
      .returning();
    return newProfile;
  }

  async updateUserProfile(userId: number, updates: Partial<InsertUserProfile>): Promise<UserProfile> {
    const [currentProfile] = await db.select()
      .from(userProfiles)
      .where(eq(userProfiles.userId, userId));

    if (!currentProfile) {
      return this.createUserProfile({
        userId,
        ...updates,
      });
    }

    const [updatedProfile] = await db.update(userProfiles)
      .set({
        ...updates,
        lastUpdated: new Date()
      })
      .where(eq(userProfiles.userId, userId))
      .returning();

    return updatedProfile;
  }
}

export const storage = new DatabaseStorage();