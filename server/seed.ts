import { storage } from "./storage";
import { hashPassword } from "./auth";
import type { InsertProduct, InsertUser, InsertSettings } from "@shared/schema";

const defaultUsers: InsertUser[] = [
  {
    email: "admin@shophub.com",
    password: "admin123",
    name: "Super Admin",
    role: "super_admin",
  },
  {
    email: "vendor@shophub.com",
    password: "vendor123",
    name: "Vendor User",
    role: "vendor",
  },
  {
    email: "support@shophub.com",
    password: "support123",
    name: "Support Agent",
    role: "support_agent",
  },
];

const sampleProducts: InsertProduct[] = [
  {
    name: "iPhone 15 Pro Max",
    description: "Latest flagship smartphone with A17 Pro chip, titanium design, and advanced camera system. 256GB storage.",
    price: "1199.99",
    originalPrice: "1299.99",
    category: "phones",
    image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&q=80",
    stock: 25,
    lowStockThreshold: 10,
    featured: true,
  },
  {
    name: "Samsung Galaxy S24 Ultra",
    description: "Premium Android smartphone with S Pen, 200MP camera, and stunning AMOLED display. 512GB storage.",
    price: "1099.99",
    category: "phones",
    image: "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=600&q=80",
    stock: 18,
    lowStockThreshold: 8,
    featured: true,
  },
  {
    name: "Google Pixel 8 Pro",
    description: "AI-powered smartphone with exceptional camera quality and pure Android experience. 256GB storage.",
    price: "899.99",
    originalPrice: "999.99",
    category: "phones",
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=600&q=80",
    stock: 30,
    lowStockThreshold: 12,
    featured: true,
  },
  {
    name: "PlayStation 5 DualSense Controller",
    description: "Next-gen wireless controller with haptic feedback, adaptive triggers, and built-in microphone.",
    price: "69.99",
    category: "gaming",
    image: "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=600&q=80",
    stock: 50,
    lowStockThreshold: 15,
    featured: true,
  },
  {
    name: "Xbox Elite Series 2 Controller",
    description: "Premium wireless gaming controller with adjustable tension thumbsticks and paddles.",
    price: "179.99",
    originalPrice: "199.99",
    category: "gaming",
    image: "https://images.unsplash.com/photo-1585504198199-20277593b94f?w=600&q=80",
    stock: 22,
    lowStockThreshold: 10,
    featured: false,
  },
  {
    name: "Nintendo Switch Pro Controller",
    description: "Ergonomic wireless controller with motion controls, HD rumble, and long battery life.",
    price: "64.99",
    category: "gaming",
    image: "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=600&q=80",
    stock: 35,
    lowStockThreshold: 12,
    featured: false,
  },
  {
    name: "SanDisk Ultra 256GB USB Flash Drive",
    description: "High-speed USB 3.0 flash drive with 256GB storage capacity and reliable data transfer.",
    price: "29.99",
    category: "storage",
    image: "https://images.unsplash.com/photo-1624823183493-ed5832f48f18?w=600&q=80",
    stock: 100,
    lowStockThreshold: 20,
    featured: false,
  },
  {
    name: "Samsung T7 Portable SSD 1TB",
    description: "Ultra-fast external SSD with USB 3.2 Gen 2 for blazing transfer speeds up to 1050MB/s.",
    price: "119.99",
    originalPrice: "149.99",
    category: "storage",
    image: "https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&q=80",
    stock: 40,
    lowStockThreshold: 15,
    featured: true,
  },
  {
    name: "Sony WH-1000XM5 Headphones",
    description: "Industry-leading noise cancelling wireless headphones with exceptional sound quality and 30-hour battery.",
    price: "379.99",
    category: "audio",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",
    stock: 28,
    lowStockThreshold: 10,
    featured: true,
  },
  {
    name: "Apple AirPods Pro (2nd Gen)",
    description: "Premium wireless earbuds with active noise cancellation, spatial audio, and MagSafe charging.",
    price: "249.99",
    category: "audio",
    image: "https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=600&q=80",
    stock: 45,
    lowStockThreshold: 15,
    featured: true,
  },
  {
    name: "JBL Flip 6 Portable Speaker",
    description: "Waterproof portable Bluetooth speaker with powerful sound and 12-hour playtime.",
    price: "129.99",
    originalPrice: "149.99",
    category: "audio",
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&q=80",
    stock: 32,
    lowStockThreshold: 12,
    featured: false,
  },
  {
    name: "Anker PowerCore 20000mAh Power Bank",
    description: "High-capacity portable charger with fast charging support for smartphones and tablets.",
    price: "49.99",
    category: "accessories",
    image: "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600&q=80",
    stock: 60,
    lowStockThreshold: 20,
    featured: false,
  },
  {
    name: "Spigen Ultra Hybrid Phone Case",
    description: "Clear protective case with military-grade drop protection and wireless charging compatible.",
    price: "14.99",
    category: "accessories",
    image: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=600&q=80",
    stock: 150,
    lowStockThreshold: 30,
    featured: false,
  },
  {
    name: "Belkin 3-in-1 Wireless Charger",
    description: "Fast wireless charging pad for iPhone, Apple Watch, and AirPods simultaneously.",
    price: "89.99",
    originalPrice: "109.99",
    category: "accessories",
    image: "https://images.unsplash.com/photo-1591290619762-d118de4f3f6f?w=600&q=80",
    stock: 0,
    lowStockThreshold: 10,
    featured: false,
  },
  {
    name: "USB-C to HDMI Cable 6ft",
    description: "High-speed 4K HDMI cable for connecting laptops and phones to external displays.",
    price: "19.99",
    category: "accessories",
    image: "https://images.unsplash.com/photo-1625948515291-69613efd103f?w=600&q=80",
    stock: 75,
    lowStockThreshold: 20,
    featured: false,
  },
];

export async function seedDatabase() {
  try {
    console.log("Seeding database...");
    
    // Seed default settings
    const existingSettings = await storage.getSettings();
    if (!existingSettings) {
      const defaultSettings: InsertSettings = {
        storeName: "SMICE GADGETS",
        storeEmail: "fosurandy0@gmail.com",
        storePhone: "+233 XX XXX XXXX",
        currency: "GHS",
        taxRate: "0",
        heroTitle: "Discover Amazing Products at Unbeatable Prices",
        heroSubtitle: "Shop the latest electronics and gadgets in Accra",
      };
      await storage.updateSettings(defaultSettings);
      console.log("Seeded default settings");
    }
    
    // Seed default admin users
    const existingUsers = await storage.getUsers();
    if (existingUsers.length === 0) {
      for (const user of defaultUsers) {
        const hashedPassword = await hashPassword(user.password);
        await storage.createUser({ ...user, password: hashedPassword });
      }
      console.log(`Seeded ${defaultUsers.length} admin users`);
      console.log("Default login credentials:");
      console.log("- Super Admin: admin@shophub.com / admin123");
      console.log("- Vendor: vendor@shophub.com / vendor123");
      console.log("- Support: support@shophub.com / support123");
    }
    
    // Seed products
    const existingProducts = await storage.getProducts();
    if (existingProducts.length === 0) {
      for (const product of sampleProducts) {
        await storage.createProduct(product);
      }
      console.log(`Seeded ${sampleProducts.length} products`);
    } else {
      console.log(`Database already contains ${existingProducts.length} products, skipping product seed`);
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}
