import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { setupAuth, requireAuth, requireRole } from "./auth";
import {
  insertTableSchema,
  insertCategorySchema,
  insertMenuItemSchema,
  insertOrderSchema,
  insertOrderItemSchema,
  insertFeedbackSchema,
  insertInventorySchema,
} from "@shared/schema";
import { z } from "zod";
import { nanoid } from "nanoid";
import * as ai from "./ai";

interface WebSocketClient extends WebSocket {
  id: string;
  userId?: number;
  role?: string;
}

let wss: WebSocketServer;
const clients = new Map<string, WebSocketClient>();

function broadcastToRole(message: any, role: string) {
  const messageStr = JSON.stringify(message);
  clients.forEach((client) => {
    if (client.role === role && client.readyState === WebSocket.OPEN) {
      client.send(messageStr);
    }
  });
}

function broadcastToAll(message: any) {
  const messageStr = JSON.stringify(message);
  clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(messageStr);
    }
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);

  // Restaurant info
  app.get("/api/restaurant", async (req, res) => {
    try {
      const restaurant = await storage.getRestaurant(1);
      res.json(restaurant);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch restaurant info" });
    }
  });

  // Menu endpoints
  app.get("/api/menu", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      const menuItems = await storage.getMenuItems();
      
      const menuWithCategories = categories.map(category => ({
        ...category,
        items: menuItems.filter(item => item.categoryId === category.id)
      }));
      
      res.json(menuWithCategories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch menu" });
    }
  });

  app.get("/api/menu-items", async (req, res) => {
    try {
      const menuItems = await storage.getMenuItems();
      res.json(menuItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch menu items" });
    }
  });

  app.post("/api/menu-items", requireRole(["admin"]), async (req, res) => {
    try {
      const validatedData = insertMenuItemSchema.parse(req.body);
      const menuItem = await storage.createMenuItem(validatedData);
      res.status(201).json(menuItem);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create menu item" });
    }
  });

  app.put("/api/menu-items/:id", requireRole(["admin"]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const menuItem = await storage.updateMenuItem(id, updates);
      
      if (!menuItem) {
        return res.status(404).json({ message: "Menu item not found" });
      }
      
      res.json(menuItem);
    } catch (error) {
      res.status(500).json({ message: "Failed to update menu item" });
    }
  });

  app.delete("/api/menu-items/:id", requireRole(["admin"]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteMenuItem(id);
      
      if (!success) {
        return res.status(404).json({ message: "Menu item not found" });
      }
      
      res.json({ message: "Menu item deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete menu item" });
    }
  });

  // Categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.post("/api/categories", requireRole(["admin"]), async (req, res) => {
    try {
      const validatedData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(validatedData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  // Tables
  app.get("/api/tables", requireAuth, async (req, res) => {
    try {
      const tables = await storage.getTables();
      res.json(tables);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tables" });
    }
  });

  app.get("/api/tables/:qrCode", async (req, res) => {
    try {
      const { qrCode } = req.params;
      const table = await storage.getTableByQR(qrCode);
      
      if (!table) {
        return res.status(404).json({ message: "Table not found" });
      }
      
      res.json(table);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch table" });
    }
  });

  app.post("/api/tables", requireRole(["admin"]), async (req, res) => {
    try {
      const validatedData = insertTableSchema.parse(req.body);
      const table = await storage.createTable(validatedData);
      res.status(201).json(table);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create table" });
    }
  });

  app.put("/api/tables/:id", requireRole(["admin"]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const table = await storage.updateTable(id, updates);
      
      if (!table) {
        return res.status(404).json({ message: "Table not found" });
      }
      
      res.json(table);
    } catch (error) {
      res.status(500).json({ message: "Failed to update table" });
    }
  });

  app.delete("/api/tables/:id", requireRole(["admin"]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteTable(id);
      
      if (!success) {
        return res.status(404).json({ message: "Table not found" });
      }
      
      res.json({ message: "Table deleted successfully" });
    } catch (error) {
      res.status(500).json({ message: "Failed to delete table" });
    }
  });

  // Orders
  app.get("/api/orders", requireAuth, async (req, res) => {
    try {
      const { status, tableId } = req.query;
      let orders;
      
      if (status) {
        orders = await storage.getOrdersByStatus(status as string);
      } else if (tableId) {
        orders = await storage.getOrdersByTable(parseInt(tableId as string));
      } else {
        orders = await storage.getOrders();
      }
      
      // Get order items for each order
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const items = await storage.getOrderItems(order.id);
          const itemsWithDetails = await Promise.all(
            items.map(async (item) => {
              const menuItem = await storage.getMenuItem(item.menuItemId!);
              return { ...item, menuItem };
            })
          );
          return { ...order, items: itemsWithDetails };
        })
      );
      
      res.json(ordersWithItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const { tableId, items, notes } = req.body;
      
      // Calculate total
      let total = 0;
      for (const item of items) {
        const menuItem = await storage.getMenuItem(item.menuItemId);
        if (menuItem) {
          total += parseFloat(menuItem.price) * item.quantity;
        }
      }
      
      // Create order
      const orderData = insertOrderSchema.parse({
        tableId,
        customerId: req.user?.id,
        total: total.toFixed(2),
        notes,
        estimatedTime: 20 + Math.floor(items.length * 5), // Simple estimation
      });
      
      const order = await storage.createOrder(orderData);
      
      // Create order items
      for (const item of items) {
        const menuItem = await storage.getMenuItem(item.menuItemId);
        if (menuItem) {
          await storage.createOrderItem({
            orderId: order.id,
            menuItemId: item.menuItemId,
            quantity: item.quantity,
            price: menuItem.price,
            notes: item.notes,
          });
        }
      }
      
      // Broadcast new order to staff
      broadcastToRole({
        type: "NEW_ORDER",
        order: { ...order, items }
      }, "staff");
      
      broadcastToRole({
        type: "NEW_ORDER",
        order: { ...order, items }
      }, "admin");
      
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create order" });
    }
  });

  app.put("/api/orders/:id", requireRole(["staff", "admin"]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const order = await storage.updateOrder(id, updates);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Broadcast order update
      broadcastToAll({
        type: "ORDER_UPDATED",
        order
      });
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Failed to update order" });
    }
  });

  // AI endpoints
  app.post("/api/ai/recommendations", async (req, res) => {
    try {
      const { userId, orderHistory } = req.body;
      const menuItems = await storage.getMenuItems();
      
      const recommendations = await ai.generateMealRecommendations(
        userId,
        orderHistory,
        menuItems
      );
      
      res.json(recommendations);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate recommendations" });
    }
  });

  app.post("/api/ai/upsell", async (req, res) => {
    try {
      const { cartItems } = req.body;
      const menuItems = await storage.getMenuItems();
      
      const suggestions = await ai.generateUpsellPrompts(cartItems, menuItems);
      
      res.json(suggestions);
    } catch (error) {
      res.status(500).json({ message: "Failed to generate upsell suggestions" });
    }
  });

  app.get("/api/ai/inventory-predictions", requireRole(["admin"]), async (req, res) => {
    try {
      const inventory = await storage.getInventory();
      const orders = await storage.getOrders();
      
      const predictions = await ai.predictInventoryNeeds(inventory, orders);
      
      // Update inventory with predictions
      for (const prediction of predictions) {
        const inventoryItems = await storage.getInventory();
        const item = inventoryItems.find(i => i.itemName === prediction.itemName);
        if (item) {
          await storage.updateInventoryItem(item.id, {
            predictedDays: prediction.predictedDays
          });
        }
      }
      
      res.json(predictions);
    } catch (error) {
      res.status(500).json({ message: "Failed to predict inventory needs" });
    }
  });

  app.post("/api/ai/chat", async (req, res) => {
    try {
      const { message } = req.body;
      const menuItems = await storage.getMenuItems();
      const restaurant = await storage.getRestaurant(1);
      
      const response = await ai.chatAssistant(message, {
        menuItems,
        restaurant
      });
      
      res.json({ response });
    } catch (error) {
      res.status(500).json({ message: "Failed to process chat message" });
    }
  });

  // Feedback
  app.post("/api/feedback", async (req, res) => {
    try {
      const validatedData = insertFeedbackSchema.parse(req.body);
      
      // Analyze sentiment
      const sentimentAnalysis = await ai.analyzeSentiment(validatedData.comment || "");
      
      const feedback = await storage.createFeedback({
        ...validatedData,
        customerId: req.user?.id,
      });
      
      // Update feedback with sentiment analysis
      await storage.updateFeedback(feedback.id, {
        sentiment: sentimentAnalysis.sentiment,
        sentimentScore: sentimentAnalysis.score.toFixed(2),
      });
      
      // If negative sentiment, alert staff
      if (sentimentAnalysis.sentiment === "negative") {
        broadcastToRole({
          type: "NEGATIVE_FEEDBACK",
          feedback: { ...feedback, ...sentimentAnalysis }
        }, "staff");
        
        broadcastToRole({
          type: "NEGATIVE_FEEDBACK",
          feedback: { ...feedback, ...sentimentAnalysis }
        }, "admin");
      }
      
      res.status(201).json(feedback);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create feedback" });
    }
  });

  app.get("/api/feedback", requireRole(["staff", "admin"]), async (req, res) => {
    try {
      const feedback = await storage.getFeedback();
      res.json(feedback);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch feedback" });
    }
  });

  // Inventory
  app.get("/api/inventory", requireRole(["admin"]), async (req, res) => {
    try {
      const inventory = await storage.getInventory();
      res.json(inventory);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch inventory" });
    }
  });

  app.get("/api/inventory/low-stock", requireRole(["admin"]), async (req, res) => {
    try {
      const lowStockItems = await storage.getLowStockItems();
      res.json(lowStockItems);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch low stock items" });
    }
  });

  app.post("/api/inventory", requireRole(["admin"]), async (req, res) => {
    try {
      const validatedData = insertInventorySchema.parse(req.body);
      const item = await storage.createInventoryItem(validatedData);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create inventory item" });
    }
  });

  app.put("/api/inventory/:id", requireRole(["admin"]), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const item = await storage.updateInventoryItem(id, updates);
      
      if (!item) {
        return res.status(404).json({ message: "Inventory item not found" });
      }
      
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: "Failed to update inventory item" });
    }
  });

  // Advanced analytics dashboard
  app.get("/api/analytics/dashboard", requireRole(["admin"]), async (req, res) => {
    try {
      const timeRange = req.query.timeRange as string || "7d";
      const analytics = await storage.getAnalytics(timeRange);
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: "Failed to get dashboard analytics" });
    }
  });

  app.get("/api/analytics/sales", requireRole(["admin"]), async (req, res) => {
    try {
      const timeRange = req.query.timeRange as string || "7d";
      const salesData = await storage.getSalesData(timeRange);
      res.json(salesData);
    } catch (error) {
      res.status(500).json({ message: "Failed to get sales analytics" });
    }
  });

  app.get("/api/analytics/customers", requireRole(["admin"]), async (req, res) => {
    try {
      const timeRange = req.query.timeRange as string || "7d";
      const customerData = await storage.getCustomerInsights(timeRange);
      res.json(customerData);
    } catch (error) {
      res.status(500).json({ message: "Failed to get customer analytics" });
    }
  });

  app.get("/api/analytics/products", requireRole(["admin"]), async (req, res) => {
    try {
      const timeRange = req.query.timeRange as string || "7d";
      const productData = await storage.getProductAnalytics(timeRange);
      res.json(productData);
    } catch (error) {
      res.status(500).json({ message: "Failed to get product analytics" });
    }
  });

  // Analytics
  app.get("/api/analytics", requireRole(["admin"]), async (req, res) => {
    try {
      const orders = await storage.getOrders();
      const today = new Date().toDateString();
      
      const todayOrders = orders.filter(order => 
        new Date(order.createdAt!).toDateString() === today
      );
      
      const revenue = todayOrders.reduce((sum, order) => 
        sum + parseFloat(order.total), 0
      );
      
      const completedOrders = todayOrders.filter(order => 
        order.status === "served"
      ).length;
      
      const tables = await storage.getTables();
      const activeTables = orders.filter(order => 
        order.status === "pending" || order.status === "preparing" || order.status === "ready"
      ).length;
      
      res.json({
        revenue: revenue.toFixed(2),
        orders: completedOrders,
        activeTables: `${activeTables}/${tables.length}`,
        totalTables: tables.length,
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  const httpServer = createServer(app);

  // WebSocket setup
  wss = new WebSocketServer({ 
    server: httpServer, 
    path: '/ws' 
  });

  wss.on('connection', (ws: WebSocketClient, request) => {
    ws.id = nanoid();
    clients.set(ws.id, ws);
    
    console.log(`WebSocket client connected: ${ws.id}`);
    
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === 'AUTH') {
          ws.userId = message.userId;
          ws.role = message.role;
          console.log(`Client ${ws.id} authenticated as ${message.role}`);
        }
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    });
    
    ws.on('close', () => {
      clients.delete(ws.id);
      console.log(`WebSocket client disconnected: ${ws.id}`);
    });
    
    ws.on('error', (error) => {
      console.error(`WebSocket error for client ${ws.id}:`, error);
      clients.delete(ws.id);
    });
  });

  return httpServer;
}
