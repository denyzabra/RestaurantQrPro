import { pgTable, text, serial, integer, boolean, timestamp, decimal, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default("customer"), // customer, staff, admin
  restaurantId: integer("restaurant_id").references(() => restaurants.id),
  isActive: boolean("is_active").notNull().default(true),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const restaurants = pgTable("restaurants", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  logo: text("logo"),
  website: text("website"),
  cuisine: text("cuisine"),
  openingHours: json("opening_hours"),
  subscriptionTier: text("subscription_tier").notNull().default("trial"), // trial, starter, pro, enterprise
  subscriptionStatus: text("subscription_status").notNull().default("active"), // active, cancelled, expired
  trialEndsAt: timestamp("trial_ends_at"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const tables = pgTable("tables", {
  id: serial("id").primaryKey(),
  number: text("number").notNull(),
  qrCode: text("qr_code").notNull().unique(),
  capacity: integer("capacity").notNull().default(4),
  isActive: boolean("is_active").notNull().default(true),
  restaurantId: integer("restaurant_id").references(() => restaurants.id),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  restaurantId: integer("restaurant_id").references(() => restaurants.id),
});

export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  imageUrl: text("image_url"),
  isAvailable: boolean("is_available").notNull().default(true),
  isPopular: boolean("is_popular").notNull().default(false),
  allergens: text("allergens").array(),
  categoryId: integer("category_id").references(() => categories.id),
  restaurantId: integer("restaurant_id").references(() => restaurants.id),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull().unique(),
  status: text("status").notNull().default("pending"), // pending, preparing, ready, served, cancelled
  total: decimal("total", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  estimatedTime: integer("estimated_time"), // in minutes
  tableId: integer("table_id").references(() => tables.id),
  customerId: integer("customer_id").references(() => users.id),
  staffId: integer("staff_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  quantity: integer("quantity").notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  notes: text("notes"),
  orderId: integer("order_id").references(() => orders.id),
  menuItemId: integer("menu_item_id").references(() => menuItems.id),
});

export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  rating: integer("rating").notNull(), // 1-5 stars
  comment: text("comment"),
  sentiment: text("sentiment"), // positive, negative, neutral
  sentimentScore: decimal("sentiment_score", { precision: 3, scale: 2 }),
  orderId: integer("order_id").references(() => orders.id),
  customerId: integer("customer_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  itemName: text("item_name").notNull(),
  currentStock: integer("current_stock").notNull(),
  minStock: integer("min_stock").notNull(),
  unit: text("unit").notNull(),
  predictedDays: integer("predicted_days"), // AI prediction
  restaurantId: integer("restaurant_id").references(() => restaurants.id),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(), // Starter, Pro, Enterprise
  price: integer("price").notNull(), // in UGX
  currency: text("currency").notNull().default("UGX"),
  features: json("features"), // JSON array of features
  maxBranches: integer("max_branches").notNull().default(1),
  hasAI: boolean("has_ai").notNull().default(false),
  hasAnalytics: boolean("has_analytics").notNull().default(false),
  hasCustomBranding: boolean("has_custom_branding").notNull().default(false),
  isActive: boolean("is_active").notNull().default(true),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true });
export const insertRestaurantSchema = createInsertSchema(restaurants).omit({ id: true, createdAt: true });
export const insertTableSchema = createInsertSchema(tables).omit({ id: true, qrCode: true });
export const insertCategorySchema = createInsertSchema(categories).omit({ id: true });
export const insertMenuItemSchema = createInsertSchema(menuItems).omit({ id: true });
export const insertOrderSchema = createInsertSchema(orders).omit({ 
  id: true, 
  orderNumber: true, 
  createdAt: true, 
  updatedAt: true 
});
export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true });
export const insertFeedbackSchema = createInsertSchema(feedback).omit({ 
  id: true, 
  sentiment: true, 
  sentimentScore: true, 
  createdAt: true 
});
export const insertInventorySchema = createInsertSchema(inventory).omit({ 
  id: true, 
  predictedDays: true, 
  updatedAt: true 
});
export const insertSubscriptionPlanSchema = createInsertSchema(subscriptionPlans).omit({ id: true });

// Select types
export type User = typeof users.$inferSelect;
export type Restaurant = typeof restaurants.$inferSelect;
export type Table = typeof tables.$inferSelect;
export type Category = typeof categories.$inferSelect;
export type MenuItem = typeof menuItems.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type Feedback = typeof feedback.$inferSelect;
export type Inventory = typeof inventory.$inferSelect;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;

// Insert types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertRestaurant = z.infer<typeof insertRestaurantSchema>;
export type InsertTable = z.infer<typeof insertTableSchema>;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type InsertFeedback = z.infer<typeof insertFeedbackSchema>;
export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type InsertSubscriptionPlan = z.infer<typeof insertSubscriptionPlanSchema>;
