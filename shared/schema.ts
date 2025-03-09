import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  balance: decimal("balance", { precision: 10, scale: 2 }).notNull().default("0"),
  usdtBalance: decimal("usdt_balance", { precision: 10, scale: 2 }).notNull().default("0"),
  referralCode: text("referral_code").notNull().unique(),
  referredBy: text("referred_by"),
  isAdmin: boolean("is_admin").notNull().default(false),
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
  currency: text("currency").notNull().default("INR"), // INR or USDT
  status: text("status").notNull(), // pending, completed, rejected
  transactionId: text("transaction_id"),
  referralCommission: decimal("referral_commission", { precision: 10, scale: 2 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const prices = pgTable("prices", {
  id: serial("id").primaryKey(),
  itemType: text("item_type").notNull().unique(), // chicken types, resources, eggs
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  referredBy: true,
}).partial({
  referredBy: true,
});

export const insertChickenSchema = createInsertSchema(chickens);
export const insertResourceSchema = createInsertSchema(resources);
export const insertTransactionSchema = createInsertSchema(transactions);
export const insertPriceSchema = createInsertSchema(prices);

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Chicken = typeof chickens.$inferSelect;
export type Resource = typeof resources.$inferSelect;
export type Transaction = typeof transactions.$inferSelect;
export type Price = typeof prices.$inferSelect;