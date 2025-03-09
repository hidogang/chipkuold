import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Chickens
  app.get("/api/chickens", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    const chickens = await storage.getChickensByUserId(req.user.id);
    res.json(chickens);
  });

  app.post("/api/chickens/buy", async (req, res) => {
    if (!req.user) return res.sendStatus(401);

    const schema = z.object({ type: z.enum(["baby", "regular", "golden"]) });
    const result = schema.safeParse(req.body);
    if (!result.success) return res.status(400).json(result.error);

    const prices = await storage.getPrices();
    const price = prices.find(p => p.itemType === `${result.data.type}_chicken`);
    if (!price) return res.status(400).send("Invalid chicken type");

    try {
      await storage.updateUserBalance(req.user.id, -parseFloat(price.price));
      const chicken = await storage.createChicken(req.user.id, result.data.type);
      res.json(chicken);
    } catch (err) {
      if (err instanceof Error) {
        res.status(400).send(err.message);
      } else {
        res.status(400).send("Failed to buy chicken");
      }
    }
  });

  app.post("/api/chickens/:id/hatch", async (req, res) => {
    if (!req.user) return res.sendStatus(401);

    const chickenId = parseInt(req.params.id);
    const chickens = await storage.getChickensByUserId(req.user.id);
    const chicken = chickens.find(c => c.id === chickenId);

    if (!chicken) return res.status(404).send("Chicken not found");

    const resources = await storage.getResourcesByUserId(req.user.id);
    const resourceRequirements = {
      baby: { water: 1, wheat: 1, eggs: 2 },
      regular: { water: 2, wheat: 2, eggs: 5 },
      golden: { water: 10, wheat: 15, eggs: 20 }
    };

    const required = resourceRequirements[chicken.type as keyof typeof resourceRequirements];
    if (resources.waterBuckets < required.water || resources.wheatBags < required.wheat) {
      return res.status(400).send("Insufficient resources");
    }

    await storage.updateResources(req.user.id, {
      waterBuckets: resources.waterBuckets - required.water,
      wheatBags: resources.wheatBags - required.wheat,
      eggs: resources.eggs + required.eggs
    });

    await storage.updateChickenHatchTime(chickenId);
    res.json({ success: true });
  });

  // Resources
  app.get("/api/resources", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    try {
      const resources = await storage.getResourcesByUserId(req.user.id);
      res.json(resources);
    } catch (err) {
      // If resources not found, create them
      const newResources = {
        id: req.user.id,
        userId: req.user.id,
        waterBuckets: 0,
        wheatBags: 0,
        eggs: 0
      };
      storage.resources.set(req.user.id, newResources);
      res.json(newResources);
    }
  });

  // Market
  app.get("/api/prices", async (req, res) => {
    const prices = await storage.getPrices();
    res.json(prices);
  });

  app.post("/api/market/buy", async (req, res) => {
    if (!req.user) return res.sendStatus(401);

    const schema = z.object({
      itemType: z.enum(["water_bucket", "wheat_bag"]),
      quantity: z.number().positive()
    });

    const result = schema.safeParse(req.body);
    if (!result.success) return res.status(400).json(result.error);

    const prices = await storage.getPrices();
    const price = prices.find(p => p.itemType === result.data.itemType);
    if (!price) return res.status(400).send("Invalid item type");

    const totalCost = parseFloat(price.price) * result.data.quantity;

    try {
      await storage.updateUserBalance(req.user.id, -totalCost);
      const resources = await storage.getResourcesByUserId(req.user.id);

      const updates = result.data.itemType === "water_bucket"
        ? { waterBuckets: resources.waterBuckets + result.data.quantity }
        : { wheatBags: resources.wheatBags + result.data.quantity };

      await storage.updateResources(req.user.id, updates);
      res.json({ success: true });
    } catch (err) {
      if (err instanceof Error) {
        res.status(400).send(err.message);
      } else {
        res.status(400).send("Failed to buy resource");
      }
    }
  });

  app.post("/api/market/sell", async (req, res) => {
    if (!req.user) return res.sendStatus(401);

    const schema = z.object({
      quantity: z.number().positive()
    });

    const result = schema.safeParse(req.body);
    if (!result.success) return res.status(400).json(result.error);

    const resources = await storage.getResourcesByUserId(req.user.id);
    if (resources.eggs < result.data.quantity) {
      return res.status(400).send("Insufficient eggs");
    }

    const prices = await storage.getPrices();
    const price = prices.find(p => p.itemType === "egg");
    if (!price) return res.status(400).send("Egg price not found");

    const totalEarnings = parseFloat(price.price) * result.data.quantity;

    try {
      await storage.updateUserBalance(req.user.id, totalEarnings);
      await storage.updateResources(req.user.id, {
        eggs: resources.eggs - result.data.quantity
      });
      res.json({ success: true });
    } catch (err) {
      if (err instanceof Error) {
        res.status(400).send(err.message);
      } else {
        res.status(400).send("Failed to sell eggs");
      }
    }
  });

  // Wallet
  app.get("/api/transactions", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    const transactions = await storage.getTransactionsByUserId(req.user.id);
    res.json(transactions);
  });

  app.post("/api/wallet/recharge", async (req, res) => {
    if (!req.user) return res.sendStatus(401);

    const schema = z.object({
      amount: z.number().positive(),
      transactionId: z.string()
    });

    const result = schema.safeParse(req.body);
    if (!result.success) return res.status(400).json(result.error);

    try {
      // If user was referred, calculate commission
      let referralCommission = null;
      if (req.user.referredBy) {
        const referrer = await storage.getUserByReferralCode(req.user.referredBy);
        if (referrer) {
          referralCommission = result.data.amount * 0.1; // 10% commission
          await storage.updateUserBalance(referrer.id, referralCommission);

          // Create commission transaction for referrer
          await storage.createTransaction(
            referrer.id,
            "commission",
            referralCommission
          );
        }
      }

      const transaction = await storage.createTransaction(
        req.user.id,
        "recharge",
        result.data.amount,
        result.data.transactionId,
        referralCommission
      );

      res.json(transaction);
    } catch (err) {
      if (err instanceof Error) {
        res.status(400).send(err.message);
      } else {
        res.status(400).send("Failed to process recharge");
      }
    }
  });

  app.post("/api/wallet/withdraw", async (req, res) => {
    if (!req.user) return res.sendStatus(401);

    const schema = z.object({
      amount: z.number().positive(),
      bankDetails: z.object({
        accountNumber: z.string(),
        ifsc: z.string()
      })
    });

    const result = schema.safeParse(req.body);
    if (!result.success) return res.status(400).json(result.error);

    try {
      await storage.updateUserBalance(req.user.id, -result.data.amount);
      const transaction = await storage.createTransaction(
        req.user.id,
        "withdrawal",
        result.data.amount
      );
      res.json(transaction);
    } catch (err) {
      if (err instanceof Error) {
        res.status(400).send(err.message);
      } else {
        res.status(400).send("Failed to process withdrawal");
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}