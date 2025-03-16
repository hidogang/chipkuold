import { drizzle } from 'drizzle-orm/neon-serverless';
import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from './db';
import { 
  User, Chicken, Resource, Transaction, Price, InsertUser, 
  UserProfile, InsertUserProfile, gameSettings, 
  MysteryBoxReward, InsertMysteryBoxReward, MysteryBoxContent 
} from "@shared/schema";
import { 
  users, chickens, resources, transactions, prices, 
  userProfiles, gameSettings as gameSettingsTable,
  mysteryBoxRewards 
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { randomBytes } from "crypto";
import { hashPassword } from './auth-utils';

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
  deleteChicken(chickenId: number): Promise<void>;
  getChickenCountsByType(): Promise<{ type: string, count: number }[]>;

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

  // Mystery Box operations
  purchaseMysteryBox(userId: number): Promise<void>;
  openMysteryBox(userId: number): Promise<MysteryBoxReward | null>;
  getMysteryBoxRewardsByUserId(userId: number): Promise<MysteryBoxReward[]>;
  createMysteryBoxReward(reward: InsertMysteryBoxReward): Promise<MysteryBoxReward>;
  claimMysteryBoxReward(rewardId: number): Promise<MysteryBoxReward>;
  
  // Admin methods
  getTransactions(): Promise<Transaction[]>;
  getTransactionByTransactionId(transactionId: string): Promise<Transaction | undefined>;
  updatePaymentAddress(address: string): Promise<void>;
  updateWithdrawalTax(percentage: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  public sessionStore: session.Store;
  private defaultPaymentAddress: string = "TRX8nHHo2Jd7H9ZwKhh6h8h";
  private defaultWithdrawalTax: number = 5;

  constructor() {
    // Configure memory store with appropriate settings for development
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000, // Prune expired entries every 24h
      ttl: 86400000, // Session TTL (24 hours)
      stale: false,  // Don't allow stale session data
      noDisposeOnSet: true, // Prevent disposing sessions on set
    });
    this.initializeDefaults();
  }

  private async initializeDefaults() {
    try {
      await this.initializePrices();
      await this.initializeAdminUser(); // Make sure admin is initialized
      await this.initializeGameSettings();
    } catch (error) {
      console.error("Error in initializeDefaults:", error);
      throw error;
    }
  }

  private async initializeGameSettings() {
    try {
      const [withdrawalTaxSetting] = await db.select()
        .from(gameSettingsTable)
        .where(eq(gameSettingsTable.settingKey, "withdrawal_tax"));

      if (!withdrawalTaxSetting) {
        await db.insert(gameSettingsTable).values({
          settingKey: "withdrawal_tax",
          settingValue: this.defaultWithdrawalTax.toString(),
        });
      }

      const [paymentAddressSetting] = await db.select()
        .from(gameSettingsTable)
        .where(eq(gameSettingsTable.settingKey, "payment_address"));

      if (!paymentAddressSetting) {
        await db.insert(gameSettingsTable).values({
          settingKey: "payment_address",
          settingValue: this.defaultPaymentAddress,
        });
      }
    } catch (error) {
      console.error("Error initializing game settings:", error);
      throw error;
    }
  }

  private async initializeAdminUser() {
    try {
      console.log("[Storage] Checking for admin user existence...");
      const adminExists = await this.getUserByUsername("adminraja");
      if (!adminExists) {
        console.log("[Storage] Admin user not found, creating new admin account...");
        const hashedPassword = await hashPassword("admin8751");
        await db.insert(users).values({
          username: "adminraja",
          password: hashedPassword,
          usdtBalance: "0",
          referralCode: "ADMIN",
          isAdmin: true
        });

        const [admin] = await db.select().from(users).where(eq(users.username, "adminraja"));
        console.log("[Storage] Created admin user with ID:", admin.id);

        await db.insert(resources).values({
          userId: admin.id,
          waterBuckets: 0,
          wheatBags: 0,
          eggs: 0
        });

        console.log("[Storage] Admin user created successfully with resources initialized");
      } else {
        console.log("[Storage] Admin user already exists with ID:", adminExists.id);
      }
    } catch (error) {
      console.error("[Storage] Error initializing admin user:", error);
      throw error;
    }
  }

  private async initializePrices() {
    try {
      const defaultPrices = [
        { itemType: "baby_chicken", price: "90" },
        { itemType: "regular_chicken", price: "150" },
        { itemType: "golden_chicken", price: "400" },
        { itemType: "water_bucket", price: "0.5" },
        { itemType: "wheat_bag", price: "0.5" },
        { itemType: "egg", price: "0.1" },
        { itemType: "mystery_box", price: "50" }
      ];

      for (const price of defaultPrices) {
        const [existing] = await db.select().from(prices).where(eq(prices.itemType, price.itemType));
        if (!existing) {
          await db.insert(prices).values(price);
        }
      }
      console.log("[Storage] Prices initialized successfully");
    } catch (error) {
      console.error("[Storage] Error initializing prices:", error);
      throw error;
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
      eggs: 0,
      mysteryBoxes: 0
    });

    return user;
  }

  async updateUserBalance(userId: number, amount: number): Promise<void> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      if (!user) throw new Error("User not found");

      const newBalance = parseFloat(user.usdtBalance) + amount;
      if (newBalance < 0) throw new Error("Insufficient USDT balance");

      await db.update(users)
        .set({ usdtBalance: newBalance.toFixed(2) })
        .where(eq(users.id, userId));
    } catch (error) {
      console.error("Error updating user balance:", error);
      throw error;
    }
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

  async deleteChicken(chickenId: number): Promise<void> {
    await db.delete(chickens)
      .where(eq(chickens.id, chickenId));
  }

  async getChickenCountsByType(): Promise<{ type: string, count: number }[]> {
    const result = await db
      .select({
        type: chickens.type,
        count: sql`COUNT(*)`,
      })
      .from(chickens)
      .groupBy(chickens.type);
    
    // Explicitly convert count to number to satisfy TypeScript
    return result.map(item => {
      return { 
        type: item.type, 
        count: parseInt(String(item.count), 10) 
      };
    });
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
      .set({ price: price.toFixed(2) })  // Ensure price is stored as string with 2 decimal places
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
    try {
      await db.update(gameSettingsTable)
        .set({ settingValue: address })
        .where(eq(gameSettingsTable.settingKey, "payment_address"));
    } catch (error) {
      console.error("Error updating payment address:", error);
      throw error;
    }
  }

  async updateWithdrawalTax(percentage: number): Promise<void> {
    if (percentage < 0 || percentage > 100) {
      throw new Error("Withdrawal tax percentage must be between 0 and 100");
    }
    try {
      await db.update(gameSettingsTable)
        .set({ settingValue: percentage.toString() })
        .where(eq(gameSettingsTable.settingKey, "withdrawal_tax"));
    } catch (error) {
      console.error("Error updating withdrawal tax:", error);
      throw error;
    }
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

  // Mystery Box operations
  async purchaseMysteryBox(userId: number): Promise<void> {
    try {
      // Get the mystery box price
      const [mysteryBoxPrice] = await db.select()
        .from(prices)
        .where(eq(prices.itemType, "mystery_box"));
      
      if (!mysteryBoxPrice) {
        throw new Error("Mystery box price not configured");
      }

      const price = parseFloat(mysteryBoxPrice.price);
      
      // Check if user has enough balance
      const user = await this.getUser(userId);
      if (!user) {
        throw new Error("User not found");
      }
      
      const userBalance = parseFloat(user.usdtBalance);
      if (userBalance < price) {
        throw new Error("Insufficient USDT balance");
      }
      
      // Deduct user balance
      await this.updateUserBalance(userId, -price);
      
      // Update user's mystery box count
      const resource = await this.getResourcesByUserId(userId);
      await this.updateResources(userId, {
        mysteryBoxes: (resource.mysteryBoxes || 0) + 1
      });
      
      // Create transaction record
      await this.createTransaction(
        userId,
        "mystery_box",
        price,
        undefined,
        undefined,
        JSON.stringify({ action: "purchase" })
      );
    } catch (error) {
      console.error("Error purchasing mystery box:", error);
      throw error;
    }
  }

  async openMysteryBox(userId: number): Promise<MysteryBoxReward | null> {
    try {
      // Check if user has a mystery box to open
      const resource = await this.getResourcesByUserId(userId);
      if (!resource.mysteryBoxes || resource.mysteryBoxes <= 0) {
        throw new Error("No mystery boxes available");
      }
      
      // Reduce the mystery box count
      await this.updateResources(userId, {
        mysteryBoxes: resource.mysteryBoxes - 1
      });
      
      // Generate a random reward
      const rewardType = this.getRandomRewardType();
      let rewardValue: MysteryBoxContent;
      
      switch (rewardType) {
        case "usdt":
          // Random USDT amount between 1 and 50
          const amount = Math.floor(Math.random() * 50) + 1;
          rewardValue = { rewardType, amount };
          break;
        case "chicken":
          // Random chicken type
          const chickenTypes = ["baby", "regular", "golden"];
          const chickenType = chickenTypes[Math.floor(Math.random() * chickenTypes.length)];
          rewardValue = { rewardType, chickenType };
          break;
        case "resources":
          // Random resource type and amount
          const resourceTypes = ["water_buckets", "wheat_bags"];
          const resourceType = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];
          const resourceAmount = Math.floor(Math.random() * 15) + 5; // 5-20
          rewardValue = { rewardType, resourceType, resourceAmount };
          break;
        default:
          throw new Error("Invalid reward type");
      }
      
      // Create a mystery box reward record
      const reward = await this.createMysteryBoxReward({
        userId,
        rewardType,
        rewardValue: JSON.stringify(rewardValue),
        opened: false
      });
      
      return reward;
    } catch (error) {
      console.error("Error opening mystery box:", error);
      throw error;
    }
  }
  
  private getRandomRewardType(): "usdt" | "chicken" | "resources" {
    // Probabilities:
    // 10% chance for USDT
    // 20% chance for chicken
    // 70% chance for resources
    const rand = Math.random() * 100;
    if (rand < 10) {
      return "usdt";
    } else if (rand < 30) {
      return "chicken";
    } else {
      return "resources";
    }
  }

  async getMysteryBoxRewardsByUserId(userId: number): Promise<MysteryBoxReward[]> {
    return db.select()
      .from(mysteryBoxRewards)
      .where(eq(mysteryBoxRewards.userId, userId))
      .orderBy(desc(mysteryBoxRewards.createdAt));
  }

  async createMysteryBoxReward(reward: InsertMysteryBoxReward): Promise<MysteryBoxReward> {
    const [newReward] = await db.insert(mysteryBoxRewards)
      .values(reward)
      .returning();
    return newReward;
  }

  async claimMysteryBoxReward(rewardId: number): Promise<MysteryBoxReward> {
    try {
      const [reward] = await db.select()
        .from(mysteryBoxRewards)
        .where(eq(mysteryBoxRewards.id, rewardId));
      
      if (!reward) {
        throw new Error("Reward not found");
      }
      
      if (reward.opened) {
        throw new Error("Reward already claimed");
      }
      
      const rewardValue = JSON.parse(reward.rewardValue) as MysteryBoxContent;
      const userId = reward.userId;
      
      switch (rewardValue.rewardType) {
        case "usdt":
          if (rewardValue.amount) {
            await this.updateUserBalance(userId, rewardValue.amount);
          }
          break;
        case "chicken":
          if (rewardValue.chickenType) {
            await this.createChicken(userId, rewardValue.chickenType);
          }
          break;
        case "resources":
          if (rewardValue.resourceType && rewardValue.resourceAmount) {
            const resource = await this.getResourcesByUserId(userId);
            const updates: Partial<Resource> = {};
            
            if (rewardValue.resourceType === "water_buckets") {
              updates.waterBuckets = resource.waterBuckets + rewardValue.resourceAmount;
            } else if (rewardValue.resourceType === "wheat_bags") {
              updates.wheatBags = resource.wheatBags + rewardValue.resourceAmount;
            }
            
            await this.updateResources(userId, updates);
          }
          break;
      }
      
      // Mark reward as claimed
      const [updatedReward] = await db.update(mysteryBoxRewards)
        .set({ opened: true })
        .where(eq(mysteryBoxRewards.id, rewardId))
        .returning();
      
      return updatedReward;
    } catch (error) {
      console.error("Error claiming mystery box reward:", error);
      throw error;
    }
  }
}

export const storage = new DatabaseStorage();