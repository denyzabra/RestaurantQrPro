import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle, XCircle, Eye, AlertTriangle } from "lucide-react";
import { Order } from "@shared/schema";

interface OrderCardProps {
  order: Order & { items?: any[] };
  onStatusChange: (orderId: number, newStatus: string) => void;
}

export default function OrderCard({ order, onStatusChange }: OrderCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "preparing":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "ready":
        return "bg-green-100 text-green-800 border-green-200";
      case "served":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "preparing":
        return <AlertTriangle className="h-4 w-4" />;
      case "ready":
        return <CheckCircle className="h-4 w-4" />;
      case "served":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getTimeAgo = (date: Date | string) => {
    const now = new Date();
    const orderTime = new Date(date);
    const diffInMinutes = Math.floor((now.getTime() - orderTime.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes} min ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hr ago`;
    return `${Math.floor(diffInMinutes / 1440)} day ago`;
  };

  const getNextActions = (status: string) => {
    switch (status) {
      case "pending":
        return [
          { label: "Start Preparing", action: "preparing", variant: "default" as const },
          { label: "Cancel", action: "cancelled", variant: "destructive" as const }
        ];
      case "preparing":
        return [
          { label: "Mark Ready", action: "ready", variant: "default" as const },
          { label: "Cancel", action: "cancelled", variant: "destructive" as const }
        ];
      case "ready":
        return [
          { label: "Mark Served", action: "served", variant: "default" as const },
          { label: "Back to Preparing", action: "preparing", variant: "outline" as const }
        ];
      default:
        return [];
    }
  };

  const nextActions = getNextActions(order.status);

  return (
    <Card className={`border-l-4 ${
      order.status === "pending" ? "border-l-yellow-500" :
      order.status === "preparing" ? "border-l-orange-500" :
      order.status === "ready" ? "border-l-green-500" :
      order.status === "served" ? "border-l-blue-500" :
      "border-l-red-500"
    }`}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-lg font-semibold text-gray-900">
                Table {order.tableId}
              </h3>
              <Badge variant="outline" className="text-xs">
                #{order.orderNumber}
              </Badge>
            </div>
            <p className="text-sm text-gray-600">
              {getTimeAgo(order.createdAt!)}
              {order.estimatedTime && (
                <span className="ml-2">• Est. {order.estimatedTime} min</span>
              )}
            </p>
          </div>
          
          <Badge className={`${getStatusColor(order.status)} flex items-center space-x-1`}>
            {getStatusIcon(order.status)}
            <span className="capitalize">{order.status}</span>
          </Badge>
        </div>

        {/* Order Items */}
        <div className="space-y-2 mb-4">
          {order.items?.map((item: any, index: number) => (
            <div key={index} className="flex justify-between items-center text-sm">
              <span className="flex items-center">
                <span className="bg-gray-100 text-gray-700 rounded-full w-6 h-6 flex items-center justify-center text-xs mr-2">
                  {item.quantity}
                </span>
                {item.menuItem?.name || `Item ${item.menuItemId}`}
                {item.notes && (
                  <span className="text-gray-500 ml-2 italic">({item.notes})</span>
                )}
              </span>
              <span className="font-medium">${(parseFloat(item.price) * item.quantity).toFixed(2)}</span>
            </div>
          )) || (
            <div className="text-sm text-gray-500 italic">Loading order details...</div>
          )}
        </div>

        {/* Order Notes */}
        {order.notes && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
            <p className="text-sm text-yellow-800">
              <strong>Special requests:</strong> {order.notes}
            </p>
          </div>
        )}

        {/* Total and Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200">
          <div>
            <p className="text-sm text-gray-600">Total</p>
            <p className="text-xl font-bold text-gray-900">${order.total}</p>
          </div>
          
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-1" />
              Details
            </Button>
            {nextActions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant}
                size="sm"
                onClick={() => onStatusChange(order.id, action.action)}
              >
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
