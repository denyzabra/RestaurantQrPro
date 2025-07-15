import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import QRCodeGenerator from "@/components/qr-code-generator";
import { 
  Plus, 
  Edit, 
  Trash2, 
  TrendingUp, 
  Users, 
  AlertTriangle,
  DollarSign,
  Package,
  QrCode,
  Star,
  Clock
} from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertMenuItemSchema, insertTableSchema, insertCategorySchema } from "@shared/schema";
import { z } from "zod";

type MenuItemFormData = z.infer<typeof insertMenuItemSchema>;
type TableFormData = z.infer<typeof insertTableSchema>;
type CategoryFormData = z.infer<typeof insertCategorySchema>;

export default function AdminPanel() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [showAddMenuItem, setShowAddMenuItem] = useState(false);
  const [showAddTable, setShowAddTable] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [selectedQRTable, setSelectedQRTable] = useState<any>(null);

  const { data: analytics } = useQuery({
    queryKey: ["/api/analytics"],
  });

  const { data: menuItems = [] } = useQuery({
    queryKey: ["/api/menu-items"],
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  const { data: tables = [] } = useQuery({
    queryKey: ["/api/tables"],
  });

  const { data: orders = [] } = useQuery({
    queryKey: ["/api/orders"],
  });

  const { data: inventory = [] } = useQuery({
    queryKey: ["/api/inventory"],
  });

  const { data: lowStockItems = [] } = useQuery({
    queryKey: ["/api/inventory/low-stock"],
  });

  const { data: inventoryPredictions = [] } = useQuery({
    queryKey: ["/api/ai/inventory-predictions"],
  });

  const createMenuItemMutation = useMutation({
    mutationFn: async (data: MenuItemFormData) => {
      const res = await apiRequest("POST", "/api/menu-items", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Menu item created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/menu-items"] });
      setShowAddMenuItem(false);
    },
  });

  const createTableMutation = useMutation({
    mutationFn: async (data: TableFormData) => {
      const res = await apiRequest("POST", "/api/tables", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Table created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/tables"] });
      setShowAddTable(false);
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (data: CategoryFormData) => {
      const res = await apiRequest("POST", "/api/categories", data);
      return res.json();
    },
    onSuccess: () => {
      toast({ title: "Category created successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      setShowAddCategory(false);
    },
  });

  const deleteMenuItemMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/menu-items/${id}`);
    },
    onSuccess: () => {
      toast({ title: "Menu item deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ["/api/menu-items"] });
    },
  });

  const menuItemForm = useForm<MenuItemFormData>({
    resolver: zodResolver(insertMenuItemSchema),
    defaultValues: {
      name: "",
      description: "",
      price: "",
      imageUrl: "",
      categoryId: undefined,
      restaurantId: 1,
      isAvailable: true,
      isPopular: false,
      allergens: [],
    },
  });

  const tableForm = useForm<TableFormData>({
    resolver: zodResolver(insertTableSchema),
    defaultValues: {
      number: "",
      capacity: 4,
      isActive: true,
      restaurantId: 1,
    },
  });

  const categoryForm = useForm<CategoryFormData>({
    resolver: zodResolver(insertCategorySchema),
    defaultValues: {
      name: "",
      description: "",
      sortOrder: 0,
      isActive: true,
      restaurantId: 1,
    },
  });

  const onCreateMenuItem = (data: MenuItemFormData) => {
    createMenuItemMutation.mutate(data);
  };

  const onCreateTable = (data: TableFormData) => {
    createTableMutation.mutate(data);
  };

  const onCreateCategory = (data: CategoryFormData) => {
    createCategoryMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-primary">SnapServe</span>
              <span className="ml-2 text-sm text-gray-600">Admin Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <Badge variant="secondary">
                {user?.username} ({user?.role})
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="menu">Menu</TabsTrigger>
            <TabsTrigger value="tables">Tables</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="staff">Staff</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Analytics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="bg-primary/10 p-3 rounded-lg">
                      <DollarSign className="h-6 w-6 text-primary" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">Today's Revenue</p>
                      <p className="text-2xl font-bold text-gray-900">
                        ${analytics?.revenue || "0.00"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="bg-success/10 p-3 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-success" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">Orders Completed</p>
                      <p className="text-2xl font-bold text-gray-900">{analytics?.orders || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="bg-accent/10 p-3 rounded-lg">
                      <Users className="h-6 w-6 text-accent" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">Tables Active</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {analytics?.activeTables || "0/0"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="bg-warning/10 p-3 rounded-lg">
                      <Package className="h-6 w-6 text-warning" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm text-gray-600">Low Stock Items</p>
                      <p className="text-2xl font-bold text-gray-900">{lowStockItems.length}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Orders and Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {orders.slice(0, 5).map((order: any) => (
                      <div key={order.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">Order #{order.orderNumber}</p>
                          <p className="text-sm text-gray-600">Table {order.tableId} • ${order.total}</p>
                        </div>
                        <Badge variant={
                          order.status === "served" ? "default" :
                          order.status === "ready" ? "secondary" :
                          order.status === "preparing" ? "outline" : "destructive"
                        }>
                          {order.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <AlertTriangle className="h-5 w-5 mr-2 text-warning" />
                    Inventory Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {lowStockItems.slice(0, 5).map((item: any) => (
                      <div key={item.id} className="bg-warning/10 border border-warning/20 rounded-lg p-3">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium text-warning">{item.itemName}</p>
                            <p className="text-sm text-gray-600">
                              {item.currentStock} {item.unit} remaining
                            </p>
                          </div>
                          <Button size="sm" variant="outline">
                            Reorder
                          </Button>
                        </div>
                      </div>
                    ))}
                    {lowStockItems.length === 0 && (
                      <p className="text-gray-600 text-center py-4">All inventory levels are normal</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="menu" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Menu Management</h2>
                <p className="text-gray-600">Manage your restaurant's menu items and categories</p>
              </div>
              <div className="space-x-2">
                <Button onClick={() => setShowAddCategory(true)} variant="outline">
                  Add Category
                </Button>
                <Button onClick={() => setShowAddMenuItem(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Menu Item
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {categories.map((category: any) => (
                <Card key={category.id}>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      {category.name}
                      <Badge variant="outline">
                        {menuItems.filter((item: any) => item.categoryId === category.id).length} items
                      </Badge>
                    </CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {menuItems
                        .filter((item: any) => item.categoryId === category.id)
                        .slice(0, 3)
                        .map((item: any) => (
                          <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center space-x-3">
                              {item.imageUrl && (
                                <img 
                                  src={item.imageUrl} 
                                  alt={item.name}
                                  className="w-10 h-10 rounded-lg object-cover"
                                />
                              )}
                              <div>
                                <p className="font-medium text-sm">{item.name}</p>
                                <p className="text-xs text-gray-600">${item.price}</p>
                              </div>
                            </div>
                            <div className="flex space-x-1">
                              <Button size="sm" variant="ghost">
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="ghost"
                                onClick={() => deleteMenuItemMutation.mutate(item.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Add Menu Item Dialog */}
            <Dialog open={showAddMenuItem} onOpenChange={setShowAddMenuItem}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Menu Item</DialogTitle>
                  <DialogDescription>Create a new menu item for your restaurant</DialogDescription>
                </DialogHeader>
                <form onSubmit={menuItemForm.handleSubmit(onCreateMenuItem)} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Name</Label>
                    <Input {...menuItemForm.register("name")} placeholder="Item name" />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea {...menuItemForm.register("description")} placeholder="Item description" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="price">Price</Label>
                      <Input {...menuItemForm.register("price")} placeholder="0.00" type="number" step="0.01" />
                    </div>
                    <div>
                      <Label htmlFor="category">Category</Label>
                      <Select onValueChange={(value) => menuItemForm.setValue("categoryId", parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category: any) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="imageUrl">Image URL</Label>
                    <Input {...menuItemForm.register("imageUrl")} placeholder="https://..." />
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setShowAddMenuItem(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createMenuItemMutation.isPending}>
                      Create Item
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            {/* Add Category Dialog */}
            <Dialog open={showAddCategory} onOpenChange={setShowAddCategory}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Category</DialogTitle>
                  <DialogDescription>Create a new menu category</DialogDescription>
                </DialogHeader>
                <form onSubmit={categoryForm.handleSubmit(onCreateCategory)} className="space-y-4">
                  <div>
                    <Label htmlFor="category-name">Name</Label>
                    <Input {...categoryForm.register("name")} placeholder="Category name" />
                  </div>
                  
                  <div>
                    <Label htmlFor="category-description">Description</Label>
                    <Textarea {...categoryForm.register("description")} placeholder="Category description" />
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setShowAddCategory(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createCategoryMutation.isPending}>
                      Create Category
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="tables" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Table Management</h2>
                <p className="text-gray-600">Manage restaurant tables and QR codes</p>
              </div>
              <Button onClick={() => setShowAddTable(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Table
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {tables.map((table: any) => (
                <Card key={table.id} className="relative">
                  <CardContent className="p-4 text-center">
                    <div className="mb-3">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                        <Users className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                    <p className="font-medium">Table {table.number}</p>
                    <p className="text-xs text-gray-600 mb-3">Capacity: {table.capacity}</p>
                    <div className="space-y-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        onClick={() => setSelectedQRTable(table)}
                      >
                        <QrCode className="h-3 w-3 mr-1" />
                        View QR
                      </Button>
                    </div>
                    <Badge 
                      variant={table.isActive ? "default" : "secondary"}
                      className="absolute top-2 right-2"
                    >
                      {table.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Add Table Dialog */}
            <Dialog open={showAddTable} onOpenChange={setShowAddTable}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Table</DialogTitle>
                  <DialogDescription>Create a new table with QR code</DialogDescription>
                </DialogHeader>
                <form onSubmit={tableForm.handleSubmit(onCreateTable)} className="space-y-4">
                  <div>
                    <Label htmlFor="table-number">Table Number</Label>
                    <Input {...tableForm.register("number")} placeholder="e.g., 01, A1" />
                  </div>
                  
                  <div>
                    <Label htmlFor="capacity">Capacity</Label>
                    <Input 
                      {...tableForm.register("capacity", { valueAsNumber: true })} 
                      type="number" 
                      placeholder="4" 
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setShowAddTable(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createTableMutation.isPending}>
                      Create Table
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            {/* QR Code Dialog */}
            <Dialog open={!!selectedQRTable} onOpenChange={() => setSelectedQRTable(null)}>
              <DialogContent className="max-w-sm">
                <DialogHeader>
                  <DialogTitle>Table {selectedQRTable?.number} QR Code</DialogTitle>
                  <DialogDescription>
                    Print this QR code and place it on the table
                  </DialogDescription>
                </DialogHeader>
                {selectedQRTable && (
                  <QRCodeGenerator 
                    value={`${window.location.origin}/menu/${selectedQRTable.qrCode}`}
                    tableNumber={selectedQRTable.number}
                  />
                )}
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
                <p className="text-gray-600">Track stock levels and AI predictions</p>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Item
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Current Inventory</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {inventory.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{item.itemName}</p>
                          <p className="text-sm text-gray-600">
                            {item.currentStock} {item.unit} • Min: {item.minStock}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={
                            item.currentStock <= item.minStock ? "destructive" :
                            item.currentStock <= item.minStock * 2 ? "secondary" : "default"
                          }>
                            {item.currentStock <= item.minStock ? "Critical" :
                             item.currentStock <= item.minStock * 2 ? "Low" : "Normal"}
                          </Badge>
                          <Button size="sm" variant="outline">
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="h-5 w-5 mr-2" />
                    AI Predictions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {inventoryPredictions.slice(0, 5).map((prediction: any, index: number) => (
                      <div key={index} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-sm">{prediction.itemName}</p>
                            <p className="text-xs text-gray-600">
                              {prediction.predictedDays} days remaining
                            </p>
                          </div>
                          <Badge variant={
                            prediction.urgency === "high" ? "destructive" :
                            prediction.urgency === "medium" ? "secondary" : "outline"
                          }>
                            {prediction.urgency}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {inventoryPredictions.length === 0 && (
                      <p className="text-gray-600 text-center py-4 text-sm">
                        AI predictions will appear here
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="staff" className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Staff Management</h2>
                <p className="text-gray-600">Manage staff accounts and permissions</p>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Staff Member
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-medium">Admin User</p>
                      <p className="text-sm text-gray-600">Administrator</p>
                      <Badge variant="default" className="mt-1">Active</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-secondary text-white rounded-full flex items-center justify-center">
                      <Users className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-medium">Staff User</p>
                      <p className="text-sm text-gray-600">Waiter</p>
                      <Badge variant="default" className="mt-1">Active</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
