import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import passport from "./auth";
import { requireAuth, requireRole, hashPassword } from "./auth";
import { storage } from "./storage";
import { insertProductSchema, insertOrderSchema, insertPromotionSchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
  });

  app.post("/api/auth/login", (req: Request, res: Response, next) => {
    try {
      loginSchema.parse(req.body);
    } catch (error) {
      return res.status(400).json({ error: "Invalid email or password format" });
    }

    passport.authenticate("local", (err: any, user: any, info: any) => {
      if (err) {
        return res.status(500).json({ error: "Authentication failed" });
      }
      if (!user) {
        return res.status(401).json({ error: info?.message || "Invalid credentials" });
      }
      req.logIn(user, (err) => {
        if (err) {
          return res.status(500).json({ error: "Login failed" });
        }
        const { password, ...userWithoutPassword } = user;
        return res.json({ user: userWithoutPassword });
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req: Request, res: Response) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ error: "Logout failed" });
      }
      res.json({ success: true });
    });
  });

  app.get("/api/auth/me", (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const user = req.user as any;
    const { password, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword });
  });

  // User management routes (admin only)
  app.get("/api/users", requireRole("super_admin"), async (req, res) => {
    try {
      const users = await storage.getUsers();
      const usersWithoutPasswords = users.map(({ password, ...user }) => user);
      res.json(usersWithoutPasswords);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.post("/api/users", requireRole("super_admin"), async (req, res) => {
    try {
      const data = insertUserSchema.parse(req.body);
      const hashedPassword = await hashPassword(data.password);
      const user = await storage.createUser({ ...data, password: hashedPassword });
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ error: "Failed to create user" });
    }
  });

  app.patch("/api/users/:id", requireRole("super_admin"), async (req, res) => {
    try {
      const { password, ...updates } = req.body;
      const updateData = password 
        ? { ...updates, password: await hashPassword(password) }
        : updates;
      const user = await storage.updateUser(req.params.id, updateData);
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ error: "Failed to update user" });
    }
  });

  app.delete("/api/users/:id", requireRole("super_admin"), async (req, res) => {
    try {
      await storage.deleteUser(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete user" });
    }
  });

  // Product routes (protected)
  app.get("/api/products", async (req, res) => {
    try {
      const products = await storage.getProducts();
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(req.params.id);
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });

  app.post("/api/products", requireRole("super_admin", "vendor"), async (req, res) => {
    try {
      const data = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(data);
      res.json(product);
    } catch (error) {
      res.status(400).json({ error: "Invalid product data" });
    }
  });

  app.patch("/api/products/:id", requireRole("super_admin", "vendor"), async (req, res) => {
    try {
      const product = await storage.updateProduct(req.params.id, req.body);
      res.json(product);
    } catch (error) {
      res.status(400).json({ error: "Failed to update product" });
    }
  });

  app.delete("/api/products/:id", requireRole("super_admin"), async (req, res) => {
    try {
      await storage.deleteProduct(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  app.get("/api/orders", async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch orders" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const order = await storage.getOrder(req.params.id);
      if (!order) {
        return res.status(404).json({ error: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch order" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const data = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(data);
      res.json(order);
    } catch (error) {
      res.status(400).json({ error: "Invalid order data" });
    }
  });

  app.patch("/api/orders/:id", requireRole("super_admin", "vendor", "support_agent"), async (req, res) => {
    try {
      const order = await storage.updateOrder(req.params.id, req.body);
      res.json(order);
    } catch (error) {
      res.status(400).json({ error: "Failed to update order" });
    }
  });

  app.get("/api/promotions", async (req, res) => {
    try {
      const promotions = await storage.getPromotions();
      res.json(promotions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch promotions" });
    }
  });

  app.post("/api/promotions", requireRole("super_admin"), async (req, res) => {
    try {
      const data = insertPromotionSchema.parse(req.body);
      const promotion = await storage.createPromotion(data);
      res.json(promotion);
    } catch (error) {
      res.status(400).json({ error: "Invalid promotion data" });
    }
  });

  app.delete("/api/promotions/:id", requireRole("super_admin"), async (req, res) => {
    try {
      await storage.deletePromotion(req.params.id);
      res.json({ success: true });
    } catch (error) {
      res.status(500).json({ error: "Failed to delete promotion" });
    }
  });

  app.get("/api/analytics", async (req, res) => {
    try {
      const analytics = await storage.getAnalytics();
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch analytics" });
    }
  });

  app.post("/api/paystack/initialize", async (req, res) => {
    try {
      if (!process.env.PAYSTACK_SECRET_KEY) {
        return res.status(500).json({ error: "Payment system not configured" });
      }

      const { email, amount, metadata } = req.body;
      
      if (!email || !amount || !metadata) {
        return res.status(400).json({ error: "Missing required payment information" });
      }
      
      const response = await fetch("https://api.paystack.co/transaction/initialize", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          amount: Math.round(amount * 100),
          metadata,
          callback_url: `${req.protocol}://${req.get('host')}/api/paystack/callback`,
        }),
      });

      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to initialize payment" });
    }
  });

  app.get("/api/paystack/verify/:reference", async (req, res) => {
    try {
      if (!process.env.PAYSTACK_SECRET_KEY) {
        return res.status(500).json({ error: "Payment system not configured" });
      }

      const { reference } = req.params;
      
      const response = await fetch(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          },
        }
      );

      const data = await response.json();
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to verify payment" });
    }
  });

  app.get("/api/paystack/callback", async (req, res) => {
    const { reference } = req.query;
    
    if (!reference) {
      return res.redirect("/?payment=failed");
    }

    try {
      if (!process.env.PAYSTACK_SECRET_KEY) {
        return res.redirect("/?payment=error");
      }

      const verifyResponse = await fetch(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          },
        }
      );

      const verifyData = await verifyResponse.json();

      if (verifyData.status && verifyData.data.status === "success") {
        const metadata = verifyData.data.metadata;
        const paidAmount = verifyData.data.amount / 100;

        let orderItems: any[] = [];
        try {
          orderItems = JSON.parse(metadata.items || "[]");
        } catch (e) {
          return res.redirect("/?payment=failed");
        }

        let calculatedSubtotal = 0;
        for (const item of orderItems) {
          const product = await storage.getProduct(item.productId);
          if (!product) {
            return res.redirect("/?payment=failed");
          }
          calculatedSubtotal += parseFloat(product.price) * item.quantity;
        }

        const calculatedShipping = calculatedSubtotal >= 50 ? 0 : 5.99;
        const calculatedTotal = calculatedSubtotal + calculatedShipping;

        if (Math.abs(calculatedTotal - paidAmount) > 0.01) {
          console.error(`Payment amount mismatch: calculated ${calculatedTotal}, paid ${paidAmount}`);
          return res.redirect("/?payment=failed");
        }

        const orderData = {
          userId: "guest",
          customerName: metadata.customerName,
          customerEmail: verifyData.data.customer.email,
          customerPhone: metadata.customerPhone,
          shippingAddress: metadata.shippingAddress,
          items: metadata.items,
          subtotal: calculatedSubtotal.toFixed(2),
          shipping: calculatedShipping.toFixed(2),
          total: calculatedTotal.toFixed(2),
          status: "confirmed",
          paymentStatus: "paid",
        };

        await storage.createOrder(orderData);
        res.redirect("/?payment=success");
      } else {
        res.redirect("/?payment=failed");
      }
    } catch (error) {
      console.error("Payment callback error:", error);
      res.redirect("/?payment=failed");
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
