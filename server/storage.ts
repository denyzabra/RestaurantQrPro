import session from "express-session";
import createMemoryStore from "memorystore";
import { nanoid } from "nanoid";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";
import {
  users, restaurants, tables, categories, menuItems, orders, orderItems, feedback, inventory,
  type User, type Restaurant, type Table, type Category, type MenuItem, 
  type Order, type OrderItem, type Feedback, type Inventory,
  type InsertUser, type InsertRestaurant, type InsertTable, type InsertCategory, 
  type InsertMenuItem, type InsertOrder, type InsertOrderItem, type InsertFeedback, 
  type InsertInventory
} from "@shared/schema";

const MemoryStore = createMemoryStore(session);
const scryptAsync = promisify(scrypt);

async function createHashedPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export interface IStorage {
  sessionStore: session.Store;
  
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, updates: Partial<User>): Promise<User | undefined>;
  
  // Restaurant methods
  getRestaurant(id: number): Promise<Restaurant | undefined>;
  createRestaurant(restaurant: InsertRestaurant): Promise<Restaurant>;
  
  // Table methods
  getTables(): Promise<Table[]>;
  getTable(id: number): Promise<Table | undefined>;
  getTableByQR(qrCode: string): Promise<Table | undefined>;
  createTable(table: InsertTable): Promise<Table>;
  updateTable(id: number, updates: Partial<Table>): Promise<Table | undefined>;
  deleteTable(id: number): Promise<boolean>;
  
  // Category methods
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, updates: Partial<Category>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;
  
  // Menu item methods
  getMenuItems(): Promise<MenuItem[]>;
  getMenuItemsByCategory(categoryId: number): Promise<MenuItem[]>;
  getMenuItem(id: number): Promise<MenuItem | undefined>;
  createMenuItem(item: InsertMenuItem): Promise<MenuItem>;
  updateMenuItem(id: number, updates: Partial<MenuItem>): Promise<MenuItem | undefined>;
  deleteMenuItem(id: number): Promise<boolean>;
  
  // Order methods
  getOrders(): Promise<Order[]>;
  getOrdersByStatus(status: string): Promise<Order[]>;
  getOrdersByTable(tableId: number): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: number, updates: Partial<Order>): Promise<Order | undefined>;
  
  // Order item methods
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  createOrderItem(item: InsertOrderItem): Promise<OrderItem>;
  
  // Feedback methods
  getFeedback(): Promise<Feedback[]>;
  createFeedback(feedback: InsertFeedback): Promise<Feedback>;
  updateFeedback(id: number, updates: Partial<Feedback>): Promise<Feedback | undefined>;
  
  // Inventory methods
  getInventory(): Promise<Inventory[]>;
  getLowStockItems(): Promise<Inventory[]>;
  getInventoryItem(id: number): Promise<Inventory | undefined>;
  createInventoryItem(item: InsertInventory): Promise<Inventory>;
  updateInventoryItem(id: number, updates: Partial<Inventory>): Promise<Inventory | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private restaurants: Map<number, Restaurant> = new Map();
  private tables: Map<number, Table> = new Map();
  private categories: Map<number, Category> = new Map();
  private menuItems: Map<number, MenuItem> = new Map();
  private orders: Map<number, Order> = new Map();
  private orderItems: Map<number, OrderItem> = new Map();
  private feedback: Map<number, Feedback> = new Map();
  private inventory: Map<number, Inventory> = new Map();
  
  private currentUserId = 1;
  private currentRestaurantId = 1;
  private currentTableId = 1;
  private currentCategoryId = 1;
  private currentMenuItemId = 1;
  private currentOrderId = 1;
  private currentOrderItemId = 1;
  private currentFeedbackId = 1;
  private currentInventoryId = 1;
  
  public sessionStore: session.Store;

  constructor() {
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
    
    // Initialize with default data
    this.initializeDefaultData();
  }

  private async initializeDefaultData() {
    // Create default restaurant
    const restaurant = await this.createRestaurant({
      name: "Bella Vista",
      description: "Modern cuisine with mountain views",
      address: "123 Mountain View Drive",
      phone: "+1-555-0123",
      email: "info@bellavista.com",
      isActive: true,
    });

    // Create admin user with proper hashed password
    const adminPassword = await createHashedPassword("AdminPass123!");
    await this.createUser({
      username: "admin",
      email: "admin@bellavista.com",
      password: adminPassword,
      role: "admin",
      isActive: true,
    });

    // Create staff user with proper hashed password
    const staffPassword = await createHashedPassword("StaffPass123!");
    await this.createUser({
      username: "staff",
      email: "staff@bellavista.com", 
      password: staffPassword,
      role: "staff",
      isActive: true,
    });

    // Create categories
    const appetizers = await this.createCategory({
      name: "Appetizers",
      description: "Start your meal right",
      sortOrder: 1,
      isActive: true,
      restaurantId: restaurant.id,
    });

    const mains = await this.createCategory({
      name: "Main Courses",
      description: "Hearty dishes for the main course",
      sortOrder: 2,
      isActive: true,
      restaurantId: restaurant.id,
    });

    const desserts = await this.createCategory({
      name: "Desserts",
      description: "Sweet endings",
      sortOrder: 3,
      isActive: true,
      restaurantId: restaurant.id,
    });

    // Create menu items
    await this.createMenuItem({
      name: "Signature Burger",
      description: "Wagyu beef, truffle aioli, aged cheddar, crispy onions on brioche bun",
      price: "28.00",
      imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300",
      isAvailable: true,
      isPopular: true,
      allergens: ["gluten", "dairy"],
      categoryId: mains.id,
      restaurantId: restaurant.id,
    });

    await this.createMenuItem({
      name: "Atlantic Salmon",
      description: "Pan-seared with quinoa pilaf, seasonal vegetables, lemon herb sauce",
      price: "32.00",
      imageUrl: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300",
      isAvailable: true,
      isPopular: false,
      allergens: ["fish"],
      categoryId: mains.id,
      restaurantId: restaurant.id,
    });

    await this.createMenuItem({
      name: "Truffle Carbonara",
      description: "Fresh linguine, pancetta, egg yolk, parmesan, black truffle shavings",
      price: "26.00",
      imageUrl: "https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300",
      isAvailable: true,
      isPopular: true,
      allergens: ["gluten", "dairy", "eggs"],
      categoryId: mains.id,
      restaurantId: restaurant.id,
    });

    await this.createMenuItem({
      name: "Chocolate Fondant",
      description: "Warm chocolate cake, molten center, vanilla ice cream, berry compote",
      price: "14.00",
      imageUrl: "https://images.unsplash.com/photo-1551024601-bec78aea704b?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&h=300",
      isAvailable: true,
      isPopular: false,
      allergens: ["gluten", "dairy", "eggs"],
      categoryId: desserts.id,
      restaurantId: restaurant.id,
    });

    // Create tables
    for (let i = 1; i <= 20; i++) {
      const tableNumber = i.toString().padStart(2, '0');
      await this.createTable({
        number: tableNumber,
        capacity: i <= 10 ? 4 : 6,
        isActive: true,
        restaurantId: restaurant.id,
      });
    }

    // Create inventory items
    await this.createInventoryItem({
      itemName: "Truffle Oil",
      currentStock: 2,
      minStock: 5,
      unit: "bottles",
      restaurantId: restaurant.id,
    });

    await this.createInventoryItem({
      itemName: "Wagyu Beef",
      currentStock: 1,
      minStock: 10,
      unit: "lbs",
      restaurantId: restaurant.id,
    });

    console.log("=".repeat(60));
    console.log("🎉 SnapServe initialized successfully!");
    console.log("=".repeat(60));
    console.log("Test Credentials:");
    console.log("📋 Admin: admin@bellavista.com / AdminPass123!");
    console.log("👨‍💼 Staff: staff@bellavista.com / StaffPass123!");
    console.log("=".repeat(60));
    console.log("🏪 Restaurant: Bella Vista");
    console.log("📊 Sample data created:");
    console.log(`   • ${this.menuItems.size} menu items`);
    console.log(`   • ${this.tables.size} tables with QR codes`);
    console.log(`   • ${this.inventory.size} inventory items`);
    console.log("=".repeat(60));
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      ...insertUser,
      id,
      role: insertUser.role || "customer",
      isActive: insertUser.isActive ?? true,
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Restaurant methods
  async getRestaurant(id: number): Promise<Restaurant | undefined> {
    return this.restaurants.get(id);
  }

  async createRestaurant(insertRestaurant: InsertRestaurant): Promise<Restaurant> {
    const id = this.currentRestaurantId++;
    const restaurant: Restaurant = { 
      ...insertRestaurant, 
      id,
      description: insertRestaurant.description || null,
      address: insertRestaurant.address || null,
      phone: insertRestaurant.phone || null,
      email: insertRestaurant.email || null,
      isActive: insertRestaurant.isActive ?? true,
    };
    this.restaurants.set(id, restaurant);
    return restaurant;
  }

  // Table methods
  async getTables(): Promise<Table[]> {
    return Array.from(this.tables.values());
  }

  async getTable(id: number): Promise<Table | undefined> {
    return this.tables.get(id);
  }

  async getTableByQR(qrCode: string): Promise<Table | undefined> {
    return Array.from(this.tables.values()).find(table => table.qrCode === qrCode);
  }

  async createTable(insertTable: InsertTable): Promise<Table> {
    const id = this.currentTableId++;
    const qrCode = nanoid(16);
    const table: Table = { 
      ...insertTable, 
      id, 
      qrCode,
      isActive: insertTable.isActive ?? true,
      capacity: insertTable.capacity ?? 4,
      restaurantId: insertTable.restaurantId || null,
    };
    this.tables.set(id, table);
    return table;
  }

  async updateTable(id: number, updates: Partial<Table>): Promise<Table | undefined> {
    const table = this.tables.get(id);
    if (!table) return undefined;
    
    const updatedTable = { ...table, ...updates };
    this.tables.set(id, updatedTable);
    return updatedTable;
  }

  async deleteTable(id: number): Promise<boolean> {
    return this.tables.delete(id);
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values()).sort((a, b) => a.sortOrder - b.sortOrder);
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.currentCategoryId++;
    const category: Category = { 
      ...insertCategory, 
      id,
      description: insertCategory.description || null,
      isActive: insertCategory.isActive ?? true,
      sortOrder: insertCategory.sortOrder ?? 0,
      restaurantId: insertCategory.restaurantId || null,
    };
    this.categories.set(id, category);
    return category;
  }

  async updateCategory(id: number, updates: Partial<Category>): Promise<Category | undefined> {
    const category = this.categories.get(id);
    if (!category) return undefined;
    
    const updatedCategory = { ...category, ...updates };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<boolean> {
    return this.categories.delete(id);
  }

  // Menu item methods
  async getMenuItems(): Promise<MenuItem[]> {
    return Array.from(this.menuItems.values()).filter(item => item.isAvailable);
  }

  async getMenuItemsByCategory(categoryId: number): Promise<MenuItem[]> {
    return Array.from(this.menuItems.values())
      .filter(item => item.categoryId === categoryId && item.isAvailable);
  }

  async getMenuItem(id: number): Promise<MenuItem | undefined> {
    return this.menuItems.get(id);
  }

  async createMenuItem(insertMenuItem: InsertMenuItem): Promise<MenuItem> {
    const id = this.currentMenuItemId++;
    const menuItem: MenuItem = { 
      ...insertMenuItem, 
      id,
      description: insertMenuItem.description || null,
      imageUrl: insertMenuItem.imageUrl || null,
      isAvailable: insertMenuItem.isAvailable ?? true,
      isPopular: insertMenuItem.isPopular ?? false,
      allergens: insertMenuItem.allergens || null,
      categoryId: insertMenuItem.categoryId || null,
      restaurantId: insertMenuItem.restaurantId || null,
    };
    this.menuItems.set(id, menuItem);
    return menuItem;
  }

  async updateMenuItem(id: number, updates: Partial<MenuItem>): Promise<MenuItem | undefined> {
    const menuItem = this.menuItems.get(id);
    if (!menuItem) return undefined;
    
    const updatedMenuItem = { ...menuItem, ...updates };
    this.menuItems.set(id, updatedMenuItem);
    return updatedMenuItem;
  }

  async deleteMenuItem(id: number): Promise<boolean> {
    return this.menuItems.delete(id);
  }

  // Order methods
  async getOrders(): Promise<Order[]> {
    return Array.from(this.orders.values())
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getOrdersByStatus(status: string): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter(order => order.status === status)
      .sort((a, b) => new Date(a.createdAt!).getTime() - new Date(b.createdAt!).getTime());
  }

  async getOrdersByTable(tableId: number): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter(order => order.tableId === tableId)
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.currentOrderId++;
    const orderNumber = `ORD-${Date.now()}-${id}`;
    const now = new Date();
    const order: Order = {
      ...insertOrder,
      id,
      orderNumber,
      status: insertOrder.status || "pending",
      notes: insertOrder.notes || null,
      estimatedTime: insertOrder.estimatedTime || null,
      tableId: insertOrder.tableId || null,
      customerId: insertOrder.customerId || null,
      staffId: insertOrder.staffId || null,
      createdAt: now,
      updatedAt: now,
    };
    this.orders.set(id, order);
    return order;
  }

  async updateOrder(id: number, updates: Partial<Order>): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder = { ...order, ...updates, updatedAt: new Date() };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  // Order item methods
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return Array.from(this.orderItems.values())
      .filter(item => item.orderId === orderId);
  }

  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.currentOrderItemId++;
    const orderItem: OrderItem = { 
      ...insertOrderItem, 
      id,
      notes: insertOrderItem.notes || null,
      orderId: insertOrderItem.orderId || null,
      menuItemId: insertOrderItem.menuItemId || null,
    };
    this.orderItems.set(id, orderItem);
    return orderItem;
  }

  // Feedback methods
  async getFeedback(): Promise<Feedback[]> {
    return Array.from(this.feedback.values())
      .sort((a, b) => new Date(b.createdAt!).getTime() - new Date(a.createdAt!).getTime());
  }

  async createFeedback(insertFeedback: InsertFeedback): Promise<Feedback> {
    const id = this.currentFeedbackId++;
    const feedback: Feedback = {
      ...insertFeedback,
      id,
      comment: insertFeedback.comment || null,
      customerId: insertFeedback.customerId || null,
      orderId: insertFeedback.orderId || null,
      sentiment: null,
      sentimentScore: null,
      createdAt: new Date(),
    };
    this.feedback.set(id, feedback);
    return feedback;
  }

  async updateFeedback(id: number, updates: Partial<Feedback>): Promise<Feedback | undefined> {
    const feedback = this.feedback.get(id);
    if (!feedback) return undefined;
    
    const updatedFeedback = { ...feedback, ...updates };
    this.feedback.set(id, updatedFeedback);
    return updatedFeedback;
  }

  // Inventory methods
  async getInventory(): Promise<Inventory[]> {
    return Array.from(this.inventory.values());
  }

  async getLowStockItems(): Promise<Inventory[]> {
    return Array.from(this.inventory.values())
      .filter(item => item.currentStock <= item.minStock);
  }

  async getInventoryItem(id: number): Promise<Inventory | undefined> {
    return this.inventory.get(id);
  }

  async createInventoryItem(insertInventory: InsertInventory): Promise<Inventory> {
    const id = this.currentInventoryId++;
    const inventory: Inventory = {
      ...insertInventory,
      id,
      restaurantId: insertInventory.restaurantId || null,
      predictedDays: null,
      updatedAt: new Date(),
    };
    this.inventory.set(id, inventory);
    return inventory;
  }

  async updateInventoryItem(id: number, updates: Partial<Inventory>): Promise<Inventory | undefined> {
    const inventory = this.inventory.get(id);
    if (!inventory) return undefined;
    
    const updatedInventory = { ...inventory, ...updates, updatedAt: new Date() };
    this.inventory.set(id, updatedInventory);
    return updatedInventory;
  }
}

export const storage = new MemStorage();
