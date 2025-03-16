import { drizzle } from 'drizzle-orm/neon-serverless';
import { eq, and, desc, sql } from 'drizzle-orm';
import { db } from './db';
import { 
  User, Chicken, Resource, Transaction, Price, InsertUser, 
  UserProfile, InsertUserProfile, gameSettings, 
  MysteryBoxReward, InsertMysteryBoxReward, MysteryBoxContent,
  ReferralEarning, InsertReferralEarning, MilestoneReward,
  InsertMilestoneReward, SalaryPayment, InsertSalaryPayment,
  DailyReward, InsertDailyReward, ActiveBoost, InsertActiveBoost,
  milestoneThresholds, referralCommissionRates, SALARY_PER_REFERRAL,
  dailyRewardsByDay, boostTypes
} from "@shared/schema";
import { 
  users, chickens, resources, transactions, prices, 
  userProfiles, gameSettings as gameSettingsTable,
  mysteryBoxRewards, referralEarnings, milestoneRewards,
  salaryPayments, dailyRewards, activeBoosts
} from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { randomBytes } from "crypto";
import { hashPassword } from './auth-utils';

// Import the salary value per referral from shared schema

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  sessionStore: session.Store;

  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBalance(userId: number, amount: number): Promise<void>;
  getUserByReferralCode(referralCode: string): Promise<User | undefined>;
  getUserReferrals(userId: number): Promise<User[]>;
  updateUserReferralEarnings(userId: number, amount: number): Promise<void>;
  updateUserTeamEarnings(userId: number, amount: number): Promise<void>;
  updateUserStreak(userId: number, streak: number): Promise<void>;
  updateLastDailyReward(userId: number, date: Date): Promise<void>;
  updateLastSalaryPaid(userId: number, date: Date): Promise<void>;

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
  
  // Referral operations
  createReferralEarning(earning: InsertReferralEarning): Promise<ReferralEarning>;
  getReferralEarningsByUserId(userId: number): Promise<ReferralEarning[]>;
  getUnclaimedReferralEarnings(userId: number): Promise<ReferralEarning[]>;
  claimReferralEarning(earningId: number): Promise<ReferralEarning>;
  
  // Milestone operations
  createMilestoneReward(milestone: InsertMilestoneReward): Promise<MilestoneReward>;
  getMilestoneRewardsByUserId(userId: number): Promise<MilestoneReward[]>;
  getUnclaimedMilestoneRewards(userId: number): Promise<MilestoneReward[]>;
  claimMilestoneReward(milestoneId: number): Promise<MilestoneReward>;
  
  // Salary operations
  createSalaryPayment(salary: InsertSalaryPayment): Promise<SalaryPayment>;
  getSalaryPaymentsByUserId(userId: number): Promise<SalaryPayment[]>;
  
  // Daily reward operations
  createDailyReward(reward: InsertDailyReward): Promise<DailyReward>;
  getDailyRewardsByUserId(userId: number): Promise<DailyReward[]>;
  claimDailyReward(rewardId: number): Promise<DailyReward>;
  getCurrentDailyReward(userId: number): Promise<DailyReward | undefined>;
  
  // Boost operations
  createBoost(boost: InsertActiveBoost): Promise<ActiveBoost>;
  getActiveBoostsByUserId(userId: number): Promise<ActiveBoost[]>;
  getActiveEggBoost(userId: number): Promise<number>; // Returns current multiplier
  
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

  async getUserReferrals(userId: number): Promise<User[]> {
    try {
      const user = await this.getUser(userId);
      if (!user) throw new Error("User not found");
      
      return db.select().from(users).where(eq(users.referredBy, user.referralCode));
    } catch (error) {
      console.error("Error getting user referrals:", error);
      throw error;
    }
  }

  async updateUserReferralEarnings(userId: number, amount: number): Promise<void> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      if (!user) throw new Error("User not found");

      const newEarnings = parseFloat(user.totalReferralEarnings || "0") + amount;
      
      await db.update(users)
        .set({ totalReferralEarnings: newEarnings.toFixed(2) })
        .where(eq(users.id, userId));
      
      // Check if user has reached any milestones
      await this.checkAndCreateMilestoneRewards(userId, newEarnings);
    } catch (error) {
      console.error("Error updating user referral earnings:", error);
      throw error;
    }
  }

  private async checkAndCreateMilestoneRewards(userId: number, totalEarnings: number): Promise<void> {
    try {
      for (const milestone of milestoneThresholds) {
        if (totalEarnings >= milestone.threshold) {
          // Check if milestone already exists
          const existingMilestones = await this.getMilestoneRewardsByUserId(userId);
          const alreadyAwarded = existingMilestones.some(m => 
            parseFloat(m.milestone.toString()) === milestone.threshold
          );
          
          if (!alreadyAwarded) {
            // Create new milestone reward
            await this.createMilestoneReward({
              userId,
              milestone: milestone.threshold.toString(),
              reward: milestone.reward.toString(),
              claimed: false
            });
          }
        }
      }
    } catch (error) {
      console.error("Error checking and creating milestone rewards:", error);
    }
  }

  async updateUserTeamEarnings(userId: number, amount: number): Promise<void> {
    try {
      const [user] = await db.select().from(users).where(eq(users.id, userId));
      if (!user) throw new Error("User not found");

      const newEarnings = parseFloat(user.totalTeamEarnings || "0") + amount;
      
      await db.update(users)
        .set({ totalTeamEarnings: newEarnings.toFixed(2) })
        .where(eq(users.id, userId));
      
      // Check if user has reached any salary thresholds
      await this.checkAndProcessMonthlySalary(userId, newEarnings);
    } catch (error) {
      console.error("Error updating user team earnings:", error);
      throw error;
    }
  }
  
  private async checkAndProcessMonthlySalary(userId: number, totalTeamEarnings: number): Promise<void> {
    try {
      const user = await this.getUser(userId);
      if (!user) return;
      
      // Get all direct referrals of this user
      const directReferrals = await this.getUserReferrals(userId);
      
      // Count referrals who have made at least one deposit
      let referralsWithDeposits = 0;
      
      for (const referral of directReferrals) {
        // Check if this referral has made any deposits
        const referralTransactions = await this.getTransactionsByUserId(referral.id);
        const hasDeposit = referralTransactions.some(
          transaction => transaction.type === 'recharge' && transaction.status === 'completed'
        );
        
        if (hasDeposit) {
          referralsWithDeposits++;
        }
      }
      
      // Calculate salary (direct proportion: 100 referrals = $100)
      const eligibleSalary = referralsWithDeposits * SALARY_PER_REFERRAL;
      
      if (eligibleSalary > 0) {
        // Check if a payment for the current month already exists
        const currentDate = new Date();
        const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
        
        const salaryPayments = await this.getSalaryPaymentsByUserId(userId);
        const alreadyPaid = salaryPayments.some(payment => payment.period === currentMonth);
        
        if (!alreadyPaid) {
          // Only pay if last payment was at least a month ago
          const lastPaidAt = user.lastSalaryPaidAt;
          const shouldPay = !lastPaidAt || 
                           (currentDate.getTime() - new Date(lastPaidAt).getTime() >= 28 * 24 * 60 * 60 * 1000);
          
          if (shouldPay) {
            // Create a new salary payment
            await this.createSalaryPayment({
              userId,
              amount: eligibleSalary.toString(),
              period: currentMonth
            });
            
            // Update user balance
            await this.updateUserBalance(userId, eligibleSalary);
            
            // Update last salary paid date
            await this.updateLastSalaryPaid(userId, currentDate);
          }
        }
      }
    } catch (error) {
      console.error("Error checking and processing monthly salary:", error);
    }
  }

  async updateUserStreak(userId: number, streak: number): Promise<void> {
    try {
      await db.update(users)
        .set({ currentStreak: streak })
        .where(eq(users.id, userId));
    } catch (error) {
      console.error("Error updating user streak:", error);
      throw error;
    }
  }

  async updateLastDailyReward(userId: number, date: Date): Promise<void> {
    try {
      await db.update(users)
        .set({ lastDailyRewardAt: date.toISOString().split('T')[0] }) // Convert to YYYY-MM-DD string
        .where(eq(users.id, userId));
    } catch (error) {
      console.error("Error updating last daily reward:", error);
      throw error;
    }
  }

  async updateLastSalaryPaid(userId: number, date: Date): Promise<void> {
    try {
      await db.update(users)
        .set({ lastSalaryPaidAt: date }) // This works because timestamp column can take Date objects
        .where(eq(users.id, userId));
    } catch (error) {
      console.error("Error updating last salary paid date:", error);
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
    try {
      const [resource] = await db.select().from(resources).where(eq(resources.userId, userId));
      
      if (!resource) {
        // Create resources for this user if they don't exist
        const [newResource] = await db.insert(resources).values({
          userId,
          waterBuckets: 0,
          wheatBags: 0,
          eggs: 0,
          mysteryBoxes: 0
        }).returning();
        
        return newResource;
      }
      
      return resource;
    } catch (error) {
      console.error("Error fetching or creating resources:", error);
      throw new Error("Failed to create resources");
    }
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

  // Referral operations
  async createReferralEarning(earning: InsertReferralEarning): Promise<ReferralEarning> {
    try {
      const [newEarning] = await db.insert(referralEarnings)
        .values(earning)
        .returning();
      return newEarning;
    } catch (error) {
      console.error("Error creating referral earning:", error);
      throw error;
    }
  }

  async getReferralEarningsByUserId(userId: number): Promise<ReferralEarning[]> {
    try {
      return db.select()
        .from(referralEarnings)
        .where(eq(referralEarnings.userId, userId))
        .orderBy(desc(referralEarnings.createdAt));
    } catch (error) {
      console.error("Error getting referral earnings by user ID:", error);
      throw error;
    }
  }

  async getUnclaimedReferralEarnings(userId: number): Promise<ReferralEarning[]> {
    try {
      return db.select()
        .from(referralEarnings)
        .where(and(
          eq(referralEarnings.userId, userId),
          eq(referralEarnings.claimed, false)
        ))
        .orderBy(desc(referralEarnings.createdAt));
    } catch (error) {
      console.error("Error getting unclaimed referral earnings:", error);
      throw error;
    }
  }

  async claimReferralEarning(earningId: number): Promise<ReferralEarning> {
    try {
      const [earning] = await db.select()
        .from(referralEarnings)
        .where(eq(referralEarnings.id, earningId));
      
      if (!earning) {
        throw new Error("Referral earning not found");
      }
      
      if (earning.claimed) {
        throw new Error("Referral earning already claimed");
      }
      
      // Add to user balance
      await this.updateUserBalance(earning.userId, parseFloat(earning.amount.toString()));
      
      // Mark as claimed
      const [updated] = await db.update(referralEarnings)
        .set({ claimed: true })
        .where(eq(referralEarnings.id, earningId))
        .returning();
      
      return updated;
    } catch (error) {
      console.error("Error claiming referral earning:", error);
      throw error;
    }
  }
  
  // Milestone operations
  async createMilestoneReward(milestone: InsertMilestoneReward): Promise<MilestoneReward> {
    try {
      const [newMilestone] = await db.insert(milestoneRewards)
        .values(milestone)
        .returning();
      return newMilestone;
    } catch (error) {
      console.error("Error creating milestone reward:", error);
      throw error;
    }
  }

  async getMilestoneRewardsByUserId(userId: number): Promise<MilestoneReward[]> {
    try {
      return db.select()
        .from(milestoneRewards)
        .where(eq(milestoneRewards.userId, userId))
        .orderBy(desc(milestoneRewards.createdAt));
    } catch (error) {
      console.error("Error getting milestone rewards by user ID:", error);
      throw error;
    }
  }

  async getUnclaimedMilestoneRewards(userId: number): Promise<MilestoneReward[]> {
    try {
      return db.select()
        .from(milestoneRewards)
        .where(and(
          eq(milestoneRewards.userId, userId),
          eq(milestoneRewards.claimed, false)
        ))
        .orderBy(desc(milestoneRewards.createdAt));
    } catch (error) {
      console.error("Error getting unclaimed milestone rewards:", error);
      throw error;
    }
  }

  async claimMilestoneReward(milestoneId: number): Promise<MilestoneReward> {
    try {
      const [milestone] = await db.select()
        .from(milestoneRewards)
        .where(eq(milestoneRewards.id, milestoneId));
      
      if (!milestone) {
        throw new Error("Milestone reward not found");
      }
      
      if (milestone.claimed) {
        throw new Error("Milestone reward already claimed");
      }
      
      // Add to user balance
      await this.updateUserBalance(milestone.userId, parseFloat(milestone.reward.toString()));
      
      // Mark as claimed
      const now = new Date();
      const [updated] = await db.update(milestoneRewards)
        .set({ 
          claimed: true,
          claimedAt: now
        })
        .where(eq(milestoneRewards.id, milestoneId))
        .returning();
      
      return updated;
    } catch (error) {
      console.error("Error claiming milestone reward:", error);
      throw error;
    }
  }
  
  // Salary operations
  async createSalaryPayment(salary: InsertSalaryPayment): Promise<SalaryPayment> {
    try {
      const [newSalary] = await db.insert(salaryPayments)
        .values(salary)
        .returning();
      return newSalary;
    } catch (error) {
      console.error("Error creating salary payment:", error);
      throw error;
    }
  }

  async getSalaryPaymentsByUserId(userId: number): Promise<SalaryPayment[]> {
    try {
      return db.select()
        .from(salaryPayments)
        .where(eq(salaryPayments.userId, userId))
        .orderBy(desc(salaryPayments.paidAt));
    } catch (error) {
      console.error("Error getting salary payments by user ID:", error);
      throw error;
    }
  }
  
  // Daily reward operations
  async createDailyReward(reward: InsertDailyReward): Promise<DailyReward> {
    try {
      const [newReward] = await db.insert(dailyRewards)
        .values(reward)
        .returning();
      return newReward;
    } catch (error) {
      console.error("Error creating daily reward:", error);
      throw error;
    }
  }

  async getDailyRewardsByUserId(userId: number): Promise<DailyReward[]> {
    try {
      return db.select()
        .from(dailyRewards)
        .where(eq(dailyRewards.userId, userId))
        .orderBy(desc(dailyRewards.createdAt));
    } catch (error) {
      console.error("Error getting daily rewards by user ID:", error);
      throw error;
    }
  }

  async claimDailyReward(rewardId: number): Promise<DailyReward> {
    try {
      const [reward] = await db.select()
        .from(dailyRewards)
        .where(eq(dailyRewards.id, rewardId));
      
      if (!reward) {
        throw new Error("Daily reward not found");
      }
      
      if (reward.claimed) {
        throw new Error("Daily reward already claimed");
      }
      
      // Provide rewards to user
      const userId = reward.userId;
      
      // Add eggs to user's resources
      if (reward.eggs > 0) {
        const resource = await this.getResourcesByUserId(userId);
        await this.updateResources(userId, {
          eggs: resource.eggs + reward.eggs
        });
      }
      
      // Add USDT to user's balance
      const usdtAmount = reward.usdt ? parseFloat(reward.usdt.toString()) : 0;
      if (usdtAmount > 0) {
        await this.updateUserBalance(userId, usdtAmount);
      }
      
      // Mark as claimed
      const [updated] = await db.update(dailyRewards)
        .set({ claimed: true })
        .where(eq(dailyRewards.id, rewardId))
        .returning();
      
      return updated;
    } catch (error) {
      console.error("Error claiming daily reward:", error);
      throw error;
    }
  }

  async getCurrentDailyReward(userId: number): Promise<DailyReward | undefined> {
    try {
      const user = await this.getUser(userId);
      if (!user) {
        throw new Error("User not found");
      }
      
      // Check if user already claimed today's reward
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const [existingReward] = await db.select()
        .from(dailyRewards)
        .where(and(
          eq(dailyRewards.userId, userId),
          sql`DATE(${dailyRewards.createdAt}) = CURRENT_DATE`
        ))
        .orderBy(desc(dailyRewards.createdAt));
      
      if (existingReward) {
        return existingReward;
      }
      
      // Calculate streak
      let streak = user.currentStreak || 0;
      const lastRewardDate = user.lastDailyRewardAt;
      
      if (lastRewardDate) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        
        const lastRewardDay = new Date(lastRewardDate);
        lastRewardDay.setHours(0, 0, 0, 0);
        
        if (lastRewardDay.getTime() >= yesterday.getTime()) {
          // User claimed reward yesterday, continue streak
          streak += 1;
          if (streak > 7) streak = 1; // Reset after 7-day cycle
        } else {
          // Streak broken
          streak = 1;
        }
      } else {
        // First day
        streak = 1;
      }
      
      // Get reward for current streak day
      const rewardData = dailyRewardsByDay.find(r => r.day === streak) || dailyRewardsByDay[0];
      
      // Create new daily reward
      const reward = await this.createDailyReward({
        userId,
        day: streak,
        eggs: rewardData.eggs,
        usdt: rewardData.usdt.toString(),
        claimed: false
      });
      
      // Update user streak
      await this.updateUserStreak(userId, streak);
      await this.updateLastDailyReward(userId, new Date());
      
      return reward;
    } catch (error) {
      console.error("Error getting current daily reward:", error);
      throw error;
    }
  }
  
  // Boost operations
  async createBoost(boost: InsertActiveBoost): Promise<ActiveBoost> {
    try {
      const [newBoost] = await db.insert(activeBoosts)
        .values(boost)
        .returning();
      return newBoost;
    } catch (error) {
      console.error("Error creating boost:", error);
      throw error;
    }
  }

  async getActiveBoostsByUserId(userId: number): Promise<ActiveBoost[]> {
    try {
      return db.select()
        .from(activeBoosts)
        .where(and(
          eq(activeBoosts.userId, userId),
          sql`${activeBoosts.expiresAt} > NOW()`
        ))
        .orderBy(desc(activeBoosts.expiresAt));
    } catch (error) {
      console.error("Error getting active boosts by user ID:", error);
      throw error;
    }
  }

  async getActiveEggBoost(userId: number): Promise<number> {
    try {
      const activeBoosts = await this.getActiveBoostsByUserId(userId);
      
      // Find highest egg production boost
      let highestMultiplier = 1; // Default (no boost)
      
      for (const boost of activeBoosts) {
        if (boost.type === "egg_production" && parseFloat(boost.multiplier.toString()) > highestMultiplier) {
          highestMultiplier = parseFloat(boost.multiplier.toString());
        }
      }
      
      return highestMultiplier;
    } catch (error) {
      console.error("Error getting active egg boost:", error);
      return 1; // Default in case of error
    }
  }
}

export const storage = new DatabaseStorage();