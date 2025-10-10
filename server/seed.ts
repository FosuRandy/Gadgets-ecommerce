import { storage } from "./storage";
import type { InsertProduct } from "@shared/schema";

const sampleProducts: InsertProduct[] = [
  {
    name: "Wireless Bluetooth Headphones",
    description: "Premium noise-cancelling wireless headphones with 30-hour battery life and superior sound quality.",
    price: "149.99",
    originalPrice: "199.99",
    category: "electronics",
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",
    stock: 45,
    lowStockThreshold: 10,
    featured: true,
  },
  {
    name: "Smart Watch Series 6",
    description: "Advanced fitness tracking, heart rate monitoring, and smartphone notifications on your wrist.",
    price: "299.99",
    category: "electronics",
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
    stock: 32,
    lowStockThreshold: 10,
    featured: true,
  },
  {
    name: "4K Ultra HD Smart TV 55\"",
    description: "Stunning 4K resolution with HDR support and built-in streaming apps.",
    price: "599.99",
    originalPrice: "799.99",
    category: "electronics",
    image: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&q=80",
    stock: 8,
    lowStockThreshold: 10,
    featured: true,
  },
  {
    name: "Laptop Ultrabook Pro",
    description: "Powerful 13-inch ultrabook with 16GB RAM, 512GB SSD, and all-day battery life.",
    price: "1299.99",
    category: "electronics",
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&q=80",
    stock: 15,
    lowStockThreshold: 5,
    featured: true,
  },
  {
    name: "Designer Leather Jacket",
    description: "Genuine leather jacket with modern fit and timeless style.",
    price: "249.99",
    originalPrice: "349.99",
    category: "fashion",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&q=80",
    stock: 22,
    lowStockThreshold: 10,
    featured: false,
  },
  {
    name: "Running Sneakers Pro",
    description: "Lightweight running shoes with advanced cushioning and breathable mesh.",
    price: "129.99",
    category: "fashion",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
    stock: 50,
    lowStockThreshold: 15,
    featured: false,
  },
  {
    name: "Classic Denim Jeans",
    description: "Premium denim jeans with perfect fit and durable construction.",
    price: "79.99",
    category: "fashion",
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&q=80",
    stock: 5,
    lowStockThreshold: 10,
    featured: false,
  },
  {
    name: "Casual Cotton T-Shirt",
    description: "Soft, breathable cotton t-shirt in various colors.",
    price: "24.99",
    originalPrice: "34.99",
    category: "fashion",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
    stock: 100,
    lowStockThreshold: 20,
    featured: false,
  },
  {
    name: "Modern Sofa Set",
    description: "Contemporary 3-seater sofa with plush cushions and durable fabric.",
    price: "899.99",
    category: "home",
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80",
    stock: 12,
    lowStockThreshold: 5,
    featured: true,
  },
  {
    name: "Luxury Bedding Set",
    description: "Egyptian cotton bedding set including duvet cover, sheets, and pillowcases.",
    price: "159.99",
    originalPrice: "219.99",
    category: "home",
    image: "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=600&q=80",
    stock: 28,
    lowStockThreshold: 10,
    featured: false,
  },
  {
    name: "Dining Table Set",
    description: "Elegant wooden dining table with 6 chairs, perfect for family meals.",
    price: "749.99",
    category: "home",
    image: "https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600&q=80",
    stock: 6,
    lowStockThreshold: 5,
    featured: false,
  },
  {
    name: "LED Desk Lamp",
    description: "Adjustable LED desk lamp with touch controls and USB charging port.",
    price: "49.99",
    category: "home",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600&q=80",
    stock: 0,
    lowStockThreshold: 10,
    featured: false,
  },
];

export async function seedDatabase() {
  try {
    console.log("Seeding database...");
    
    const existingProducts = await storage.getProducts();
    
    if (existingProducts.length === 0) {
      for (const product of sampleProducts) {
        await storage.createProduct(product);
      }
      console.log(`Seeded ${sampleProducts.length} products`);
    } else {
      console.log(`Database already contains ${existingProducts.length} products, skipping seed`);
    }
  } catch (error) {
    console.error("Error seeding database:", error);
  }
}
