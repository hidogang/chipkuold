import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Admin middleware moved to auth.ts for centralized handling

  // Admin routes
  app.get("/api/admin/transactions", async (req, res) => {
    try {
      console.log('[Admin Route] Getting transactions');
      const transactions = await storage.getTransactions();
      res.json(transactions);
    } catch (err) {
      console.error('[Admin Route] Error getting transactions:', err);
      res.status(500).json({ error: 'Failed to fetch transactions' });
    }
  });

  // Admin withdrawals endpoint
  app.get("/api/admin/withdrawals", async (req, res) => {
    const transactions = await storage.getTransactions();
    // Filter only withdrawal transactions
    const withdrawals = transactions.filter(transaction => transaction.type === "withdrawal");
    res.json(withdrawals);
  });

  // Admin stats endpoint
  app.get("/api/admin/stats", async (req, res) => {
    const transactions = await storage.getTransactions();
    const users = await storage.getUser(1); // Just to get the total users count

    // Calculate today's date (start and end)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Calculate yesterday's date (start and end)
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Filter transactions for deposits and withdrawals
    const todayDeposits = transactions
      .filter(t => t.type === "recharge" && t.status === "completed" && new Date(t.createdAt) >= today && new Date(t.createdAt) < tomorrow)
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const totalDeposits = transactions
      .filter(t => t.type === "recharge" && t.status === "completed")
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    // Calculate withdrawal statistics
    const todayWithdrawals = transactions
      .filter(t => t.type === "withdrawal" && t.status === "completed" && new Date(t.createdAt) >= today && new Date(t.createdAt) < tomorrow)
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const totalWithdrawals = transactions
      .filter(t => t.type === "withdrawal" && t.status === "completed")
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);

    const pendingWithdrawals = transactions.filter(t => t.type === "withdrawal" && t.status === "pending").length;

    const stats = {
      todayLogins: 5,
      yesterdayLogins: 8,
      totalUsers: 10,
      todayDeposits,
      totalDeposits,
      todayWithdrawals,
      totalWithdrawals,
      pendingWithdrawals
    };

    res.json(stats);
  });

  app.get("/api/admin/prices", async (req, res) => {
    try {
      const prices = await storage.getPrices();
      // Transform prices array into GamePrices object
      const gamePrices = {
        waterBucketPrice: parseFloat(prices.find(p => p.itemType === 'water_bucket')?.price || '0.5'),
        wheatBagPrice: parseFloat(prices.find(p => p.itemType === 'wheat_bag')?.price || '0.5'),
        eggPrice: parseFloat(prices.find(p => p.itemType === 'egg')?.price || '0.1'),
        babyChickenPrice: parseFloat(prices.find(p => p.itemType === 'baby_chicken')?.price || '90'),
        regularChickenPrice: parseFloat(prices.find(p => p.itemType === 'regular_chicken')?.price || '150'),
        goldenChickenPrice: parseFloat(prices.find(p => p.itemType === 'golden_chicken')?.price || '400'),
        withdrawalTaxPercentage: 5 // Default value, you might want to get this from settings table
      };
      res.json(gamePrices);
    } catch (err) {
      console.error('Error fetching game prices:', err);
      res.status(500).json({ error: 'Failed to fetch game prices' });
    }
  });

  app.post("/api/admin/prices/update", async (req, res) => {
    try {
      console.log('Received price updates:', req.body.prices);

      // Validate the array of price updates
      if (!Array.isArray(req.body.prices)) {
        console.error('Invalid price updates format:', req.body);
        return res.status(400).json({ error: "Invalid price updates format" });
      }

      // Update each price
      for (const priceUpdate of req.body.prices) {
        const schema = z.object({
          itemType: z.string(),
          price: z.number().positive(),
        });

        const result = schema.safeParse(priceUpdate);
        if (!result.success) {
          console.error('Invalid price update:', priceUpdate, result.error);
          continue;
        }

        console.log('Updating price:', result.data);
        await storage.updatePrice(result.data.itemType, result.data.price);
      }

      // Update withdrawal tax if provided
      if (typeof req.body.withdrawalTaxPercentage === 'number') {
        console.log('Updating withdrawal tax:', req.body.withdrawalTaxPercentage);
        await storage.updateWithdrawalTax(req.body.withdrawalTaxPercentage);
      }

      // Get updated prices to verify changes
      const updatedPrices = await storage.getPrices();
      console.log('Updated prices:', updatedPrices);

      res.json({ success: true, prices: updatedPrices });
    } catch (err) {
      console.error('Error updating prices:', err);
      res.status(500).json({ error: 'Failed to update prices' });
    }
  });

  app.get("/api/prices", async (req, res) => {
    try {
      const prices = await storage.getPrices();
      console.log('Fetched prices:', prices);
      res.json(prices);
    } catch (err) {
      console.error('Error fetching prices:', err);
      res.status(500).json({ error: 'Failed to fetch prices' });
    }
  });

  app.post("/api/admin/transactions/update", async (req, res) => {
    const schema = z.object({
      transactionId: z.string(),
      status: z.enum(["completed", "rejected"]),
    });

    const result = schema.safeParse(req.body);
    if (!result.success) return res.status(400).json(result.error);

    try {
      await storage.updateTransactionStatus(
        result.data.transactionId,
        result.data.status
      );

      const transaction = await storage.getTransactionByTransactionId(result.data.transactionId);
      if (!transaction) {
        return res.status(404).send("Transaction not found");
      }

      // If approved deposit, update user's balance
      if (result.data.status === "completed" && transaction.type === "recharge") {
        await storage.updateUserBalance(transaction.userId, parseFloat(transaction.amount));
      }

      res.json({ success: true });
    } catch (err) {
      if (err instanceof Error) {
        res.status(400).send(err.message);
      } else {
        res.status(400).send("Failed to update transaction");
      }
    }
  });

  app.post("/api/admin/qrcode", async (req, res) => {
    const schema = z.object({
      address: z.string(),
    });

    const result = schema.safeParse(req.body);
    if (!result.success) return res.status(400).json(result.error);

    try {
      await storage.updatePaymentAddress(result.data.address);
      res.json({ success: true });
    } catch (err) {
      if (err instanceof Error) {
        res.status(400).send(err.message);
      } else {
        res.status(400).send("Failed to update payment address");
      }
    }
  });

  app.post("/api/admin/withdrawal-tax", async (req, res) => {
    const schema = z.object({
      taxPercentage: z.number().min(0).max(100),
    });

    const result = schema.safeParse(req.body);
    if (!result.success) return res.status(400).json(result.error);

    try {
      await storage.updateWithdrawalTax(result.data.taxPercentage);
      res.json({ success: true });
    } catch (err) {
      if (err instanceof Error) {
        res.status(400).send(err.message);
      } else {
        res.status(400).send("Failed to update withdrawal tax");
      }
    }
  });

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

    // Update resources: decrease water and wheat, increase eggs
    await storage.updateResources(req.user.id, {
      waterBuckets: resources.waterBuckets - required.water,
      wheatBags: resources.wheatBags - required.wheat,
      eggs: resources.eggs + required.eggs
    });

    await storage.updateChickenHatchTime(chickenId);
    res.json({ success: true });
  });
  
  app.post("/api/chickens/sell/:id", async (req, res) => {
    if (!req.user) return res.sendStatus(401);

    try {
      const chickenId = parseInt(req.params.id);
      
      // Verify the chicken exists and belongs to the user
      const chickens = await storage.getChickensByUserId(req.user.id);
      const chicken = chickens.find(c => c.id === chickenId);
      
      if (!chicken) {
        return res.status(404).send("Chicken not found");
      }
      
      // Get the sell price (use 75% of purchase price)
      const prices = await storage.getPrices();
      const price = prices.find(p => p.itemType === `${chicken.type}_chicken`);
      
      if (!price) {
        return res.status(400).send("Invalid chicken type");
      }
      
      const sellPrice = parseFloat(price.price) * 0.75; // 75% of purchase price
      
      // Delete the chicken
      await storage.deleteChicken(chickenId);
      
      // Add funds to user's balance
      await storage.updateUserBalance(req.user.id, sellPrice);
      
      // Create a transaction record
      await storage.createTransaction(
        req.user.id,
        "sale",
        sellPrice,
        undefined,
        undefined,
        JSON.stringify({ itemType: `${chicken.type}_chicken`, action: "sell" })
      );
      
      res.json({ 
        success: true, 
        amount: sellPrice
      });
    } catch (err) {
      if (err instanceof Error) {
        res.status(400).send(err.message);
      } else {
        res.status(400).send("Failed to sell chicken");
      }
    }
  });
  
  // Get chicken counts by type
  app.get("/api/chickens/counts", async (req, res) => {
    try {
      const counts = await storage.getChickenCountsByType();
      res.json(counts);
    } catch (err) {
      if (err instanceof Error) {
        res.status(500).send(err.message);
      } else {
        res.status(500).send("Failed to get chicken counts");
      }
    }
  });

  // Resources
  app.get("/api/resources", async (req, res) => {
    if (!req.user) return res.sendStatus(401);
    try {
      const resources = await storage.getResourcesByUserId(req.user.id);
      res.json(resources);
    } catch (err) {
      // If resources not found, create a default resource
      try {
        // Create a default resource by updating with empty values
        const defaultResource = await storage.updateResources(req.user.id, {
          waterBuckets: 0,
          wheatBags: 0,
          eggs: 0
        });
        res.json(defaultResource);
      } catch (err) {
        res.status(500).json({ error: "Failed to create resources" });
      }
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
      // Get user's transactions to check if this is first deposit
      const userTransactions = await storage.getTransactionsByUserId(req.user.id);
      const previousDeposits = userTransactions.filter(t => t.type === "recharge" && t.status === "approved");
      const isFirstDeposit = previousDeposits.length === 0;
      
      // Calculate deposit amount with potential bonus
      let finalAmount = result.data.amount;
      let bonusAmount = 0;
      
      // Apply 10% first deposit bonus
      if (isFirstDeposit) {
        bonusAmount = result.data.amount * 0.1; // 10% bonus
        finalAmount += bonusAmount;
      }
      
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

      // Create the main deposit transaction
      const transaction = await storage.createTransaction(
        req.user.id,
        "recharge",
        result.data.amount, // Store original amount
        result.data.transactionId,
        referralCommission || undefined,
        isFirstDeposit ? JSON.stringify({ firstDepositBonus: bonusAmount }) : undefined
      );
      
      // If first deposit, create a bonus transaction
      if (isFirstDeposit && bonusAmount > 0) {
        await storage.createTransaction(
          req.user.id,
          "bonus",
          bonusAmount,
          `bonus-${transaction.transactionId}`,
          undefined,
          JSON.stringify({ reason: "First deposit bonus" })
        );
        
        // Immediately approve the bonus
        await storage.updateTransactionStatus(`bonus-${transaction.transactionId}`, "approved");
        await storage.updateUserBalance(req.user.id, bonusAmount);
      }

      // Return the transaction with bonus info if applicable
      res.json({
        ...transaction,
        isFirstDeposit,
        bonusAmount: isFirstDeposit ? bonusAmount : 0
      });
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
      usdtAddress: z.string().min(5).max(100)
    });

    const result = schema.safeParse(req.body);
    if (!result.success) return res.status(400).json(result.error);

    try {
      await storage.updateUserBalance(req.user.id, -result.data.amount);

      // Store USDT address as bankDetails JSON field for compatibility
      const usdtAddressData = JSON.stringify({ usdtAddress: result.data.usdtAddress });

      // Generate a unique transaction ID for withdrawal requests
      const transactionId = `W${Date.now()}${Math.floor(Math.random() * 1000)}`;

      const transaction = await storage.createTransaction(
        req.user.id,
        "withdrawal",
        result.data.amount,
        transactionId,
        undefined,
        usdtAddressData
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