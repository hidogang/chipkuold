import { User, Chicken, Resource, Transaction, Price, InsertUser } from "@shared/schema";
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
  updateUserBalance(userId: number, amount: number, currency?: string): Promise<void>;
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
    currency?: string,
    transactionId?: string,
    referralCommission?: number
  ): Promise<Transaction>;
  getTransactionsByUserId(userId: number): Promise<Transaction[]>;
  updateTransactionStatus(transactionId: string, status: string): Promise<void>;

  // Price operations
  getPrices(): Promise<Price[]>;
  updatePrice(itemType: string, price: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private chickens: Map<number, Chicken>;
  private resources: Map<number, Resource>;
  private transactions: Map<number, Transaction>;
  private prices: Map<string, Price>;
  public sessionStore: session.Store;
  private currentIds: { [key: string]: number };

  constructor() {
    this.users = new Map();
    this.chickens = new Map();
    this.resources = new Map();
    this.transactions = new Map();
    this.prices = new Map();
    this.sessionStore = new MemoryStore({ checkPeriod: 86400000 });
    this.currentIds = { users: 1, chickens: 1, transactions: 1, prices: 1 };

    // Initialize default prices and admin user
    this.initializePrices();
    this.initializeAdminUser();
  }

  private async initializeAdminUser() {
    const adminExists = await this.getUserByUsername("adminraja");
    if (!adminExists) {
      const adminUser: User = {
        id: this.currentIds.users++,
        username: "adminraja",
        password: "admin8751",
        balance: "0",
        usdtBalance: "0",
        referralCode: "ADMIN",
        referredBy: null,
        isAdmin: true,
      };
      this.users.set(adminUser.id, adminUser);
    }
  }

  private async initializePrices() {
    const defaultPrices = [
      { itemType: "baby_chicken", price: "500" },
      { itemType: "regular_chicken", price: "1500" },
      { itemType: "golden_chicken", price: "4000" },
      { itemType: "water_bucket", price: "50" },
      { itemType: "wheat_bag", price: "50" },
      { itemType: "egg", price: "10" }
    ];

    for (const price of defaultPrices) {
      this.prices.set(price.itemType, {
        id: this.currentIds.prices++,
        itemType: price.itemType,
        price: price.price
      });
    }
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async getUserByReferralCode(referralCode: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.referralCode === referralCode
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentIds.users++;
    const referralCode = randomBytes(4).toString('hex');
    const user: User = { 
      ...insertUser, 
      id, 
      balance: "0",
      usdtBalance: "0",
      referralCode,
      isAdmin: false,
    };
    this.users.set(id, user);

    // Initialize resources for new user
    this.resources.set(id, {
      id,
      userId: id,
      waterBuckets: 0,
      wheatBags: 0,
      eggs: 0
    });

    return user;
  }

  async updateUserBalance(userId: number, amount: number, currency: string = "INR"): Promise<void> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");

    if (currency === "USDT") {
      const newBalance = parseFloat(user.usdtBalance) + amount;
      if (newBalance < 0) throw new Error("Insufficient USDT balance");
      this.users.set(userId, {
        ...user,
        usdtBalance: newBalance.toFixed(2)
      });
    } else {
      const newBalance = parseFloat(user.balance) + amount;
      if (newBalance < 0) throw new Error("Insufficient balance");
      this.users.set(userId, {
        ...user,
        balance: newBalance.toFixed(2)
      });
    }
  }

  async getChickensByUserId(userId: number): Promise<Chicken[]> {
    return Array.from(this.chickens.values()).filter(
      (chicken) => chicken.userId === userId
    );
  }

  async createChicken(userId: number, type: string): Promise<Chicken> {
    const id = this.currentIds.chickens++;
    const chicken: Chicken = {
      id,
      userId,
      type,
      lastHatchTime: null
    };
    this.chickens.set(id, chicken);
    return chicken;
  }

  async updateChickenHatchTime(chickenId: number): Promise<void> {
    const chicken = this.chickens.get(chickenId);
    if (!chicken) throw new Error("Chicken not found");

    this.chickens.set(chickenId, {
      ...chicken,
      lastHatchTime: new Date()
    });
  }

  async getResourcesByUserId(userId: number): Promise<Resource> {
    const resources = this.resources.get(userId);
    if (!resources) throw new Error("Resources not found");
    return resources;
  }

  async updateResources(userId: number, updates: Partial<Resource>): Promise<Resource> {
    const current = await this.getResourcesByUserId(userId);
    const updated = { ...current, ...updates };
    this.resources.set(userId, updated);
    return updated;
  }

  async createTransaction(
    userId: number,
    type: string,
    amount: number,
    currency: string = "INR",
    transactionId?: string,
    referralCommission?: number
  ): Promise<Transaction> {
    const id = this.currentIds.transactions++;
    const transaction: Transaction = {
      id,
      userId,
      type,
      amount: amount.toString(),
      currency,
      status: "pending",
      transactionId: transactionId || randomBytes(16).toString('hex'),
      referralCommission: referralCommission?.toString(),
      createdAt: new Date()
    };
    this.transactions.set(id, transaction);
    return transaction;
  }

  async getTransactionsByUserId(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter((tx) => tx.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async updateTransactionStatus(transactionId: string, status: string): Promise<void> {
    const transaction = Array.from(this.transactions.values())
      .find(tx => tx.transactionId === transactionId);

    if (!transaction) throw new Error("Transaction not found");

    this.transactions.set(transaction.id, {
      ...transaction,
      status
    });
  }

  async getPrices(): Promise<Price[]> {
    return Array.from(this.prices.values());
  }

  async updatePrice(itemType: string, price: number): Promise<void> {
    const existing = Array.from(this.prices.values())
      .find(p => p.itemType === itemType);

    if (!existing) throw new Error("Price entry not found");

    this.prices.set(itemType, {
      ...existing,
      price: price.toString()
    });
  }
}

export const storage = new MemStorage();