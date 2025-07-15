import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  DollarSign, 
  Clock, 
  Calendar,
  Star,
  Target,
  ShoppingCart,
  Eye,
  Download
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";

interface AnalyticsData {
  salesData: {
    totalRevenue: number;
    revenueGrowth: number;
    totalOrders: number;
    ordersGrowth: number;
    averageOrderValue: number;
    aovGrowth: number;
    dailySales: Array<{
      date: string;
      revenue: number;
      orders: number;
    }>;
  };
  customerData: {
    totalCustomers: number;
    newCustomers: number;
    returningCustomers: number;
    customerSatisfaction: number;
    topCustomers: Array<{
      name: string;
      orders: number;
      totalSpent: number;
    }>;
  };
  productData: {
    topSellingItems: Array<{
      name: string;
      quantity: number;
      revenue: number;
    }>;
    categoryPerformance: Array<{
      category: string;
      revenue: number;
      orders: number;
    }>;
  };
  timeData: {
    peakHours: Array<{
      hour: string;
      orders: number;
    }>;
    weeklyTrends: Array<{
      day: string;
      revenue: number;
    }>;
  };
}

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState("7d");
  const [activeTab, setActiveTab] = useState("overview");

  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics/dashboard", timeRange],
    refetchInterval: 300000, // Refresh every 5 minutes
  });

  const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Analytics Data</h3>
        <p className="text-gray-500">Analytics data will appear here once you have orders and customers.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="24h">24 Hours</SelectItem>
              <SelectItem value="7d">7 Days</SelectItem>
              <SelectItem value="30d">30 Days</SelectItem>
              <SelectItem value="90d">90 Days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button variant="outline" size="sm">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Revenue</p>
                    <p className="text-2xl font-bold">${analytics.salesData.totalRevenue.toLocaleString()}</p>
                  </div>
                  <div className="bg-green-100 p-3 rounded-lg">
                    <DollarSign className="h-6 w-6 text-green-600" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  {analytics.salesData.revenueGrowth >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${
                    analytics.salesData.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {analytics.salesData.revenueGrowth > 0 ? '+' : ''}{analytics.salesData.revenueGrowth.toFixed(1)}%
                  </span>
                  <span className="text-sm text-gray-500 ml-1">vs last period</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Orders</p>
                    <p className="text-2xl font-bold">{analytics.salesData.totalOrders.toLocaleString()}</p>
                  </div>
                  <div className="bg-blue-100 p-3 rounded-lg">
                    <ShoppingCart className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  {analytics.salesData.ordersGrowth >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${
                    analytics.salesData.ordersGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {analytics.salesData.ordersGrowth > 0 ? '+' : ''}{analytics.salesData.ordersGrowth.toFixed(1)}%
                  </span>
                  <span className="text-sm text-gray-500 ml-1">vs last period</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Avg Order Value</p>
                    <p className="text-2xl font-bold">${analytics.salesData.averageOrderValue.toFixed(2)}</p>
                  </div>
                  <div className="bg-purple-100 p-3 rounded-lg">
                    <Target className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  {analytics.salesData.aovGrowth >= 0 ? (
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                  )}
                  <span className={`text-sm font-medium ${
                    analytics.salesData.aovGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {analytics.salesData.aovGrowth > 0 ? '+' : ''}{analytics.salesData.aovGrowth.toFixed(1)}%
                  </span>
                  <span className="text-sm text-gray-500 ml-1">vs last period</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Customer Satisfaction</p>
                    <p className="text-2xl font-bold">{analytics.customerData.customerSatisfaction.toFixed(1)}</p>
                  </div>
                  <div className="bg-yellow-100 p-3 rounded-lg">
                    <Star className="h-6 w-6 text-yellow-600" />
                  </div>
                </div>
                <div className="flex items-center mt-2">
                  <Badge variant="secondary" className="text-xs">
                    {analytics.customerData.totalCustomers} customers
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Daily revenue over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.salesData.dailySales}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Peak Hours</CardTitle>
                <CardDescription>Order volume by hour</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.timeData.peakHours}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="orders" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sales" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Daily Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.salesData.dailySales}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="orders" stroke="#82ca9d" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Weekly Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.timeData.weeklyTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="revenue" fill="#ffc658" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Customer Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Customers</span>
                    <span className="font-semibold">{analytics.customerData.totalCustomers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">New Customers</span>
                    <span className="font-semibold text-green-600">{analytics.customerData.newCustomers}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Returning Customers</span>
                    <span className="font-semibold text-blue-600">{analytics.customerData.returningCustomers}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Customers</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.customerData.topCustomers.map((customer, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-sm text-gray-600">{customer.orders} orders</p>
                      </div>
                      <span className="font-semibold text-green-600">${customer.totalSpent.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top Selling Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.productData.topSellingItems.map((item, index) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600">{item.quantity} sold</p>
                      </div>
                      <span className="font-semibold text-green-600">${item.revenue.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Category Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.productData.categoryPerformance}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="revenue"
                    >
                      {analytics.productData.categoryPerformance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}