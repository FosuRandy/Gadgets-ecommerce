import type { 
  User, InsertUser,
  Product, InsertProduct,
  Order, InsertOrder,
  Promotion, InsertPromotion,
  AnalyticsData
} from "@shared/schema";
import { db } from "./firestore";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
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
  
  getAnalytics(): Promise<AnalyticsData>;
}

export class FirestoreStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const doc = await db.collection('users').doc(id).get();
    if (!doc.exists) return undefined;
    return { id: doc.id, ...doc.data() } as User;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const snapshot = await db.collection('users').where('email', '==', email).limit(1).get();
    if (snapshot.empty) return undefined;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() } as User;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const docRef = db.collection('users').doc();
    const user: Omit<User, 'id'> = {
      ...insertUser,
      createdAt: new Date(),
    };
    await docRef.set(user);
    return { id: docRef.id, ...user };
  }

  async getProducts(): Promise<Product[]> {
    const snapshot = await db.collection('products').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  }

  async getProduct(id: string): Promise<Product | undefined> {
    const doc = await db.collection('products').doc(id).get();
    if (!doc.exists) return undefined;
    return { id: doc.id, ...doc.data() } as Product;
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const docRef = db.collection('products').doc();
    const product: Omit<Product, 'id'> = {
      ...insertProduct,
      rating: "0",
      reviewCount: 0,
      createdAt: new Date(),
    };
    await docRef.set(product);
    return { id: docRef.id, ...product };
  }

  async updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product> {
    const docRef = db.collection('products').doc(id);
    await docRef.update(updates);
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() } as Product;
  }

  async deleteProduct(id: string): Promise<void> {
    await db.collection('products').doc(id).delete();
  }

  async getOrders(): Promise<Order[]> {
    const snapshot = await db.collection('orders').orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));
  }

  async getOrder(id: string): Promise<Order | undefined> {
    const doc = await db.collection('orders').doc(id).get();
    if (!doc.exists) return undefined;
    return { id: doc.id, ...doc.data() } as Order;
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const docRef = db.collection('orders').doc();
    const order: Omit<Order, 'id'> = {
      ...insertOrder,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await docRef.set(order);

    const items = JSON.parse(insertOrder.items);
    for (const item of items) {
      const productRef = db.collection('products').doc(item.productId);
      const productDoc = await productRef.get();
      if (productDoc.exists) {
        const currentStock = productDoc.data()?.stock || 0;
        await productRef.update({ stock: Math.max(0, currentStock - item.quantity) });
      }
    }

    return { id: docRef.id, ...order };
  }

  async updateOrder(id: string, updates: Partial<InsertOrder>): Promise<Order> {
    const docRef = db.collection('orders').doc(id);
    await docRef.update({ ...updates, updatedAt: new Date() });
    const doc = await docRef.get();
    return { id: doc.id, ...doc.data() } as Order;
  }

  async getPromotions(): Promise<Promotion[]> {
    const snapshot = await db.collection('promotions').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Promotion));
  }

  async getPromotion(id: string): Promise<Promotion | undefined> {
    const doc = await db.collection('promotions').doc(id).get();
    if (!doc.exists) return undefined;
    return { id: doc.id, ...doc.data() } as Promotion;
  }

  async createPromotion(insertPromotion: InsertPromotion): Promise<Promotion> {
    const docRef = db.collection('promotions').doc();
    const promotion: Omit<Promotion, 'id'> = {
      ...insertPromotion,
      usageCount: 0,
      createdAt: new Date(),
    };
    await docRef.set(promotion);
    return { id: docRef.id, ...promotion };
  }

  async deletePromotion(id: string): Promise<void> {
    await db.collection('promotions').doc(id).delete();
  }

  async getAnalytics(): Promise<AnalyticsData> {
    const [productsSnap, ordersSnap, usersSnap] = await Promise.all([
      db.collection('products').get(),
      db.collection('orders').get(),
      db.collection('users').get(),
    ]);

    const products = productsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    const orders = ordersSnap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order));

    const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total), 0);
    const totalOrders = orders.length;
    const totalProducts = products.length;
    const totalCustomers = new Set(orders.map(o => o.customerEmail)).size;

    const salesByCategory = products.reduce((acc, product) => {
      const category = product.category;
      const revenue = orders.reduce((sum, order) => {
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

    const topProducts = products.map(product => {
      const { revenue, units } = orders.reduce((acc, order) => {
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

    const lowStockProducts = products.filter(p => p.stock <= p.lowStockThreshold);

    return {
      totalRevenue,
      totalOrders,
      totalProducts,
      totalCustomers,
      revenueChange: 12.5,
      ordersChange: 8.3,
      topProducts,
      salesByCategory,
      recentOrders: orders.slice(0, 10),
      lowStockProducts,
    };
  }
}

export const storage = new FirestoreStorage();
