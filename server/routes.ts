import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertFoodItemSchema, insertAddressSchema, insertOrderSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Food Items
  app.get("/api/food-items", async (req, res) => {
    try {
      const items = await storage.getFoodItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch food items" });
    }
  });

  app.get("/api/food-items/:id", async (req, res) => {
    try {
      const item = await storage.getFoodItem(req.params.id);
      if (!item) {
        return res.status(404).json({ message: "Food item not found" });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch food item" });
    }
  });

  app.post("/api/food-items", async (req, res) => {
    try {
      const validatedData = insertFoodItemSchema.parse(req.body);
      const item = await storage.createFoodItem(validatedData);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create food item" });
    }
  });

  app.put("/api/food-items/:id", async (req, res) => {
    try {
      const validatedData = insertFoodItemSchema.partial().parse(req.body);
      const item = await storage.updateFoodItem(req.params.id, validatedData);
      if (!item) {
        return res.status(404).json({ message: "Food item not found" });
      }
      res.json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update food item" });
    }
  });

  app.delete("/api/food-items/:id", async (req, res) => {
    try {
      const success = await storage.deleteFoodItem(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Food item not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete food item" });
    }
  });

  // Addresses
  app.get("/api/addresses", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      const addresses = await storage.getAddressesByUserId(userId);
      res.json(addresses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch addresses" });
    }
  });

  app.post("/api/addresses", async (req, res) => {
    try {
      const validatedData = insertAddressSchema.parse(req.body);
      const address = await storage.createAddress(validatedData);
      res.status(201).json(address);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create address" });
    }
  });

  app.put("/api/addresses/:id", async (req, res) => {
    try {
      const validatedData = insertAddressSchema.partial().parse(req.body);
      const address = await storage.updateAddress(req.params.id, validatedData);
      if (!address) {
        return res.status(404).json({ message: "Address not found" });
      }
      res.json(address);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update address" });
    }
  });

  app.delete("/api/addresses/:id", async (req, res) => {
    try {
      const success = await storage.deleteAddress(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Address not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete address" });
    }
  });

  // Orders
  app.get("/api/orders", async (req, res) => {
    try {
      const userId = req.query.userId as string;
      const all = req.query.all as string;
      
      if (all === "true") {
        const orders = await storage.getAllOrders();
        res.json(orders);
      } else if (userId) {
        const orders = await storage.getOrdersByUserId(userId);
        res.json(orders);
      } else {
        return res.status(400).json({ message: "User ID is required" });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch order" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const validatedData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(validatedData);
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.put("/api/orders/:id", async (req, res) => {
    try {
      const validatedData = insertOrderSchema.partial().parse(req.body);
      const order = await storage.updateOrder(req.params.id, validatedData);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update order" });
    }
  });

  // Payment simulation
  app.post("/api/payment/process", async (req, res) => {
    try {
      const { orderId, paymentMethod } = req.body;
      
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simulate payment success (95% success rate)
      const success = Math.random() > 0.05;
      
      if (success) {
        // Update order payment status
        await storage.updateOrder(orderId, {
          paymentStatus: "paid",
          status: "preparing"
        });
        
        res.json({
          success: true,
          message: "Payment processed successfully",
          transactionId: `txn_${Date.now()}`
        });
      } else {
        res.status(400).json({
          success: false,
          message: "Payment failed. Please try again."
        });
      }
    } catch (error) {
      res.status(500).json({ message: "Payment processing failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
