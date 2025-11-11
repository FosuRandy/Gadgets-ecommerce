import type { 
  User, InsertUser,
  Product, InsertProduct,
  Order, InsertOrder,
  Promotion, InsertPromotion,
  Settings, InsertSettings,
  AnalyticsData
} from "@shared/schema";
import { users, products, orders, promotions, settings } from "@shared/schema";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  getUsers(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User>;
  deleteUser(id: string): Promise<void>;
  
  getProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, product: Partial<InsertProduct>): Promise<Product>;
  deleteProduct(id: string): Promise<void>;
  
  getOrders(): Promise<Order[]>;
  getOrder(id: string): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: string, order: Partial<InsertOrder>): Promise<Order>;
  
  getPromotions(): Promise<Promotion[]>;
  getPromotion(id: string): Promise<Promotion | undefined>;
  createPromotion(promotion: InsertPromotion): Promise<Promotion>;
  deletePromotion(id: string): Promise<void>;
  
  getSettings(): Promise<Settings | undefined>;
  updateSettings(updates: Partial<InsertSettings>): Promise<Settings>;
  
  getAnalytics(): Promise<AnalyticsData>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
    return user || undefined;
  }

  async getUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        active: true,
      })
      .returning();
    return user;
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set(updates)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  async getProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product || undefined;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const [product] = await db
      .insert(products)
      .values({
        ...insertProduct,
        rating: "0",
        reviewCount: 0,
      })
      .returning();
    return product;
  }

  async updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product> {
    const [product] = await db
      .update(products)
      .set(updates)
      .where(eq(products.id, id))
      .returning();
    return product;
  }

  async deleteProduct(id: string): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  async getOrders(): Promise<Order[]> {
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order || undefined;
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const [order] = await db
      .insert(orders)
      .values(insertOrder)
      .returning();

    const items = JSON.parse(insertOrder.items);
    for (const item of items) {
      const [product] = await db
        .select()
        .from(products)
        .where(eq(products.id, item.productId));
      
      if (product) {
        await db
          .update(products)
          .set({ stock: Math.max(0, product.stock - item.quantity) })
          .where(eq(products.id, item.productId));
      }
    }

    return order;
  }

  async updateOrder(id: string, updates: Partial<InsertOrder>): Promise<Order> {
    const [order] = await db
      .update(orders)
      .set({ 
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(orders.id, id))
      .returning();
    return order;
  }

  async getPromotions(): Promise<Promotion[]> {
    return await db.select().from(promotions);
  }

  async getPromotion(id: string): Promise<Promotion | undefined> {
    const [promotion] = await db.select().from(promotions).where(eq(promotions.id, id));
    return promotion || undefined;
  }

  async createPromotion(insertPromotion: InsertPromotion): Promise<Promotion> {
    const [promotion] = await db
      .insert(promotions)
      .values({
        ...insertPromotion,
        usageCount: 0,
      })
      .returning();
    return promotion;
  }

  async deletePromotion(id: string): Promise<void> {
    await db.delete(promotions).where(eq(promotions.id, id));
  }

  async getSettings(): Promise<Settings | undefined> {
    const [setting] = await db.select().from(settings).limit(1);
    return setting || undefined;
  }

  async updateSettings(updates: Partial<InsertSettings>): Promise<Settings> {
    const [existingSetting] = await db.select().from(settings).limit(1);
    
    if (!existingSetting) {
      const defaultValues: InsertSettings = {
        storeName: "SMICE GADGETS",
        storeEmail: "fosurandy0@gmail.com",
        storePhone: "+233 XX XXX XXXX",
        currency: "GHS",
        heroTitle: "Discover Amazing Products at Unbeatable Prices",
        heroSubtitle: "Shop the latest electronics and gadgets",
        ...updates,
      };
      const [newSetting] = await db
        .insert(settings)
        .values(defaultValues)
        .returning();
      return newSetting;
    }
    
    const [updatedSetting] = await db
      .update(settings)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(settings.id, existingSetting.id))
      .returning();
    return updatedSetting;
  }

  async getAnalytics(): Promise<AnalyticsData> {
    const [allProducts, allOrders, allUsers] = await Promise.all([
      db.select().from(products),
      db.select().from(orders),
      db.select().from(users),
    ]);

    const totalRevenue = allOrders.reduce((sum, order) => sum + parseFloat(order.total), 0);
    const totalOrders = allOrders.length;
    const totalProducts = allProducts.length;
    const totalCustomers = new Set(allOrders.map(o => o.customerEmail)).size;

    const salesByCategory = allProducts.reduce((acc, product) => {
      const category = product.category;
      const revenue = allOrders.reduce((sum, order) => {
        const items = JSON.parse(order.items);
        const item = items.find((i: any) => i.productId === product.id);
        return sum + (item ? parseFloat(item.price) * item.quantity : 0);
      }, 0);
      
      const existing = acc.find(c => c.category === category);
      if (existing) {
        existing.revenue += revenue;
      } else {
        acc.push({ category, revenue });
      }
      return acc;
    }, [] as Array<{ category: string; revenue: number }>);

    const topProducts = allProducts.map(product => {
      const { revenue, units } = allOrders.reduce((acc, order) => {
        const items = JSON.parse(order.items);
        const item = items.find((i: any) => i.productId === product.id);
        if (item) {
          acc.revenue += parseFloat(item.price) * item.quantity;
          acc.units += item.quantity;
        }
        return acc;
      }, { revenue: 0, units: 0 });
      return { product, revenue, units };
    }).sort((a, b) => b.revenue - a.revenue);

    const lowStockProducts = allProducts.filter(p => p.stock <= p.lowStockThreshold);

    return {
      totalRevenue,
      totalOrders,
      totalProducts,
      totalCustomers,
      revenueChange: 12.5,
      ordersChange: 8.3,
      topProducts,
      salesByCategory,
      recentOrders: allOrders.slice(0, 10),
      lowStockProducts,
    };
  }
}

export const storage = new DatabaseStorage();
