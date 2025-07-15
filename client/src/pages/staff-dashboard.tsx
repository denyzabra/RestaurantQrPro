import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useWebSocket } from "@/lib/websocket";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import OrderCard from "@/components/order-card";
import { 
  Plus, 
  AlertTriangle, 
  Clock, 
  CheckCircle, 
  XCircle,
  Users,
  BarChart3,
  TrendingUp,
  Coffee
} from "lucide-react";
import { Order } from "@shared/schema";

export default function StaffDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [showManualOrder, setShowManualOrder] = useState(false);
  
  useWebSocket();

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: tables = [] } = useQuery({
    queryKey: ["/api/tables"],
  });

  const { data: menuItems = [] } = useQuery({
    queryKey: ["/api/menu-items"],
  });

  const { data: feedback = [] } = useQuery({
    queryKey: ["/api/feedback"],
  });

  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, updates }: { orderId: number; updates: any }) => {
      const res = await apiRequest("PUT", `/api/orders/${orderId}`, updates);
      return res.json();
    },
    onSuccess: (updatedOrder) => {
      toast({
        title: "Order updated",
        description: `Order #${updatedOrder.orderNumber} status changed to ${updatedOrder.status}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to update order",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter orders based on selected status
  const filteredOrders = orders.filter(order => {
    if (selectedStatus === "all") return true;
    return order.status === selectedStatus;
  });

  // Get active orders (not served or cancelled)
  const activeOrders = orders.filter(order => 
    order.status === "pending" || order.status === "preparing" || order.status === "ready"
  );

  // Get negative feedback
  const negativeFeedback = feedback.filter((fb: any) => 
    fb.sentiment === "negative" && fb.rating <= 2
  );

  const handleOrderStatusChange = (orderId: number, newStatus: string) => {
    updateOrderMutation.mutate({ orderId, updates: { status: newStatus } });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-primary">SnapServe</span>
              <span className="ml-2 text-sm text-gray-600">Staff Dashboard</span>
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
        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-warning/10 p-3 rounded-lg">
                  <Clock className="h-6 w-6 text-warning" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Active Orders</p>
                  <p className="text-2xl font-bold text-gray-900">{activeOrders.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-success/10 p-3 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-success" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Completed Today</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {orders.filter(o => o.status === "served").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-primary/10 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Tables Occupied</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {activeOrders.length}/{tables.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="bg-destructive/10 p-3 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <div className="ml-4">
                  <p className="text-sm text-gray-600">Issues</p>
                  <p className="text-2xl font-bold text-gray-900">{negativeFeedback.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Negative Feedback Alerts */}
        {negativeFeedback.length > 0 && (
          <Card className="mb-6 border-destructive/20 bg-destructive/5">
            <CardHeader>
              <CardTitle className="flex items-center text-destructive">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Customer Feedback Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {negativeFeedback.slice(0, 3).map((fb: any) => (
                  <div key={fb.id} className="bg-white p-4 rounded-lg border border-destructive/20">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium text-destructive">
                          {fb.rating} star rating - Table {fb.orderId}
                        </p>
                        <p className="text-sm text-gray-600 mt-1">{fb.comment}</p>
                      </div>
                      <Button size="sm" variant="destructive">
                        Address Issue
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Orders Section */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Order Queue</CardTitle>
                  <div className="flex space-x-2">
                    <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Orders</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="preparing">Preparing</SelectItem>
                        <SelectItem value="ready">Ready</SelectItem>
                        <SelectItem value="served">Served</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={() => setShowManualOrder(!showManualOrder)} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      New Order
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {showManualOrder && (
                  <Card className="mb-6 border-primary/20 bg-primary/5">
                    <CardHeader>
                      <CardTitle className="text-lg">Create Manual Order</CardTitle>
                      <CardDescription>For walk-in customers or phone orders</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="table-select">Table</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select table" />
                            </SelectTrigger>
                            <SelectContent>
                              {tables.map((table: any) => (
                                <SelectItem key={table.id} value={table.id.toString()}>
                                  Table {table.number}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="customer-name">Customer Name</Label>
                          <Input placeholder="Enter customer name" />
                        </div>
                      </div>
                      <div className="flex space-x-2 mt-4">
                        <Button size="sm">Create Order</Button>
                        <Button size="sm" variant="outline" onClick={() => setShowManualOrder(false)}>
                          Cancel
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="space-y-4">
                  {filteredOrders.length === 0 ? (
                    <div className="text-center py-12">
                      <Coffee className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No orders found</p>
                      <p className="text-sm text-gray-500">
                        {selectedStatus === "all" 
                          ? "Orders will appear here as customers place them" 
                          : `No orders with status "${selectedStatus}"`
                        }
                      </p>
                    </div>
                  ) : (
                    filteredOrders.map((order) => (
                      <OrderCard
                        key={order.id}
                        order={order}
                        onStatusChange={handleOrderStatusChange}
                      />
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions Sidebar */}
          <div>
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className="w-full justify-start" variant="outline">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Table Status
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Today's Summary
                  </Button>
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="h-4 w-4 mr-2" />
                    Customer Feedback
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Table Status Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Table Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {tables.slice(0, 8).map((table: any) => {
                    const hasActiveOrder = activeOrders.some(order => order.tableId === table.id);
                    return (
                      <div
                        key={table.id}
                        className={`p-3 rounded-lg text-center ${
                          hasActiveOrder 
                            ? "bg-success/10 border border-success/20" 
                            : "bg-gray-100 border border-gray-200"
                        }`}
                      >
                        <p className="font-medium text-sm">Table {table.number}</p>
                        <p className={`text-xs ${hasActiveOrder ? "text-success" : "text-gray-500"}`}>
                          {hasActiveOrder ? "Occupied" : "Available"}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
