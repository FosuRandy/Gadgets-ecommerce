import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password"),
  googleId: text("google_id").unique(),
  name: text("name").notNull(),
  phone: text("phone"),
  role: text("role", { enum: ["super_admin", "vendor", "support_agent", "customer"] }).notNull().default("customer"),
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const products = pgTable("products", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  originalPrice: decimal("original_price", { precision: 10, scale: 2 }),
  category: text("category").notNull(),
  image: text("image").notNull(),
  stock: integer("stock").notNull().default(0),
  lowStockThreshold: integer("low_stock_threshold").notNull().default(10),
  rating: decimal("rating", { precision: 3, scale: 2 }).default("0"),
  reviewCount: integer("review_count").default(0),
  featured: boolean("featured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  deliveryAddress: text("delivery_address").notNull(),
  items: text("items").notNull(), // JSON string
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"),
  paymentStatus: text("payment_status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const promotions = pgTable("promotions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  code: text("code").notNull().unique(),
  type: text("type").notNull(), // percentage or fixed
  value: decimal("value", { precision: 10, scale: 2 }).notNull(),
  minPurchase: decimal("min_purchase", { precision: 10, scale: 2 }).default("0"),
  maxDiscount: decimal("max_discount", { precision: 10, scale: 2 }),
  validFrom: timestamp("valid_from").notNull(),
  validUntil: timestamp("valid_until").notNull(),
  active: boolean("active").default(true),
  usageCount: integer("usage_count").default(0),
  usageLimit: integer("usage_limit"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  rating: true,
  reviewCount: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPromotionSchema = createInsertSchema(promotions).omit({
  id: true,
  createdAt: true,
  usageCount: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

export type InsertPromotion = z.infer<typeof insertPromotionSchema>;
export type Promotion = typeof promotions.$inferSelect;

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: string;
  quantity: number;
  image: string;
}

export const settings = pgTable("settings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  storeName: text("store_name").notNull(),
  storeEmail: text("store_email").notNull(),
  storePhone: text("store_phone").notNull(),
  currency: text("currency").notNull().default("GHS"),
  heroTitle: text("hero_title").notNull(),
  heroSubtitle: text("hero_subtitle").notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSettingsSchema = createInsertSchema(settings).omit({
  id: true,
  updatedAt: true,
});

export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settings.$inferSelect;

export const passwordResets = pgTable("password_resets", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  phone: text("phone").notNull(),
  otp: text("otp").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  attempts: integer("attempts").default(0),
  verified: boolean("verified").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertPasswordResetSchema = createInsertSchema(passwordResets).omit({
  id: true,
  createdAt: true,
  attempts: true,
  verified: true,
});

export type InsertPasswordReset = z.infer<typeof insertPasswordResetSchema>;
export type PasswordReset = typeof passwordResets.$inferSelect;

export interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCustomers: number;
  revenueChange: number;
  ordersChange: number;
  topProducts: Array<{ product: Product; revenue: number; units: number }>;
  salesByCategory: Array<{ category: string; revenue: number }>;
  recentOrders: Order[];
  lowStockProducts: Product[];
}
