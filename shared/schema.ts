import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  usdtBalance: decimal("usdt_balance", { precision: 10, scale: 2 }).notNull().default("0"),
  referralCode: text("referral_code").notNull().unique(),
  referredBy: text("referred_by"),
  isAdmin: boolean("is_admin").notNull().default(false),
  lastLoginAt: timestamp("last_login_at"),
});

export const chickens = pgTable("chickens", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // baby, regular, golden
  lastHatchTime: timestamp("last_hatch_time"),
});

export const resources = pgTable("resources", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  waterBuckets: integer("water_buckets").notNull().default(0),
  wheatBags: integer("wheat_bags").notNull().default(0),
  eggs: integer("eggs").notNull().default(0),
});

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  type: text("type").notNull(), // recharge, withdrawal, purchase, commission
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull(), // pending, completed, rejected
  transactionId: text("transaction_id"),
  referralCommission: decimal("referral_commission", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  bankDetails: text("bank_details"), // JSON string containing bank account details
});

export const gameSettings = pgTable("game_settings", {
  id: serial("id").primaryKey(),
  settingKey: text("setting_key").notNull().unique(),
  settingValue: text("setting_value").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const prices = pgTable("prices", {
  id: serial("id").primaryKey(),
  itemType: text("item_type").notNull().unique(), // chicken types, resources, eggs
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
});

export const userProfiles = pgTable("user_profiles", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique(),
  farmName: text("farm_name"),
  avatarColor: text("avatar_color").default("#6366F1"), // Default indigo color
  avatarStyle: text("avatar_style").default("default"),
  farmBackground: text("farm_background").default("default"),
  lastUpdated: timestamp("last_updated").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users)
  .pick({
    username: true,
    password: true,
    referredBy: true,
  })
  .extend({
    username: z.string().min(3, "Username must be at least 3 characters"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    referredBy: z.string().nullish(),
  })
  .partial({
    referredBy: true,
  });

export const insertChickenSchema = createInsertSchema(chickens);
export const insertResourceSchema = createInsertSchema(resources);
export const insertTransactionSchema = createInsertSchema(transactions)
  .extend({
    amount: z.number()
      .min(0.01, "Amount must be greater than 0")
      .max(1000000, "Amount cannot exceed 1,000,000"),
    type: z.enum(["recharge", "withdrawal", "purchase", "commission"]),
    status: z.enum(["pending", "completed", "rejected"]),
    bankDetails: z.string().nullish(),
  });
export const insertPriceSchema = createInsertSchema(prices);
export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  lastUpdated: true,
});

export const insertGameSettingSchema = createInsertSchema(gameSettings).omit({
  id: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Chicken = typeof chickens.$inferSelect;
export type Resource = typeof resources.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type Price = typeof prices.$inferSelect;
export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;
export type GameSetting = typeof gameSettings.$inferSelect;


// Admin types
export interface AdminStats {
  todayLogins: number;
  yesterdayLogins: number;
  totalUsers: number;
  todayDeposits: number;
  totalDeposits: number;
  pendingWithdrawals: number;
}

export interface BankDetails {
  accountNumber: string;
  ifsc: string;
  accountName: string;
}

export interface USDTWithdrawal {
  amount: number;
  usdtAddress: string;
}

export interface GamePrices {
  waterBucketPrice: number;
  wheatBagPrice: number;
  eggPrice: number;
  babyChickenPrice: number;
  regularChickenPrice: number;
  goldenChickenPrice: number;
  withdrawalTaxPercentage: number;
}