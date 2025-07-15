import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useWebSocket } from "@/lib/websocket";
import FloatingChat from "@/components/floating-chat";
import MenuItemCard from "@/components/menu-item-card";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { 
  ShoppingCart, 
  Mic, 
  QrCode, 
  Sparkles, 
  Plus, 
  Minus, 
  Star,
  Clock
} from "lucide-react";

interface CartItem {
  menuItemId: number;
  name: string;
  price: string;
  quantity: number;
  notes?: string;
}

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: string;
  imageUrl?: string;
  isPopular: boolean;
  allergens: string[];
}

interface Category {
  id: number;
  name: string;
  description: string;
  items: MenuItem[];
}

export default function MenuPage() {
  const { tableId } = useParams();
  const { toast } = useToast();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [orderNotes, setOrderNotes] = useState("");
  const [isListening, setIsListening] = useState(false);
  
  useWebSocket();

  const { data: table } = useQuery({
    queryKey: ["/api/tables", tableId],
    enabled: !!tableId,
  });

  const { data: menu = [], isLoading } = useQuery<Category[]>({
    queryKey: ["/api/menu"],
  });

  const { data: recommendations = [] } = useQuery({
    queryKey: ["/api/ai/recommendations"],
    queryFn: async () => {
      const res = await apiRequest("POST", "/api/ai/recommendations", {
        userId: null,
        orderHistory: []
      });
      return res.json();
    },
  });

  const { data: upsellSuggestions = [] } = useQuery({
    queryKey: ["/api/ai/upsell", cart],
    queryFn: async () => {
      if (cart.length === 0) return { suggestions: [] };
      const res = await apiRequest("POST", "/api/ai/upsell", {
        cartItems: cart
      });
      return res.json();
    },
    enabled: cart.length > 0,
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      const res = await apiRequest("POST", "/api/orders", orderData);
      return res.json();
    },
    onSuccess: (order) => {
      toast({
        title: "Order placed successfully!",
        description: `Order #${order.orderNumber} - Estimated time: ${order.estimatedTime} minutes`,
      });
      setCart([]);
      setOrderNotes("");
      queryClient.invalidateQueries({ queryKey: ["/api/orders"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to place order",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const addToCart = (item: MenuItem, quantity = 1) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.menuItemId === item.id);
      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.menuItemId === item.id
            ? { ...cartItem, quantity: cartItem.quantity + quantity }
            : cartItem
        );
      }
      return [...prevCart, {
        menuItemId: item.id,
        name: item.name,
        price: item.price,
        quantity,
      }];
    });
    
    toast({
      title: "Added to cart",
      description: `${item.name} added to your order`,
    });
  };

  const updateCartItemQuantity = (menuItemId: number, quantity: number) => {
    if (quantity <= 0) {
      setCart(prevCart => prevCart.filter(item => item.menuItemId !== menuItemId));
    } else {
      setCart(prevCart =>
        prevCart.map(item =>
          item.menuItemId === menuItemId ? { ...item, quantity } : item
        )
      );
    }
  };

  const cartTotal = cart.reduce((total, item) => 
    total + (parseFloat(item.price) * item.quantity), 0
  );

  const cartItemCount = cart.reduce((count, item) => count + item.quantity, 0);

  const handleVoiceOrder = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognition = new SpeechRecognition();
      
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      
      recognition.onstart = () => {
        setIsListening(true);
      };
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        toast({
          title: "Voice command received",
          description: `"${transcript}" - Processing...`,
        });
        // Here you could integrate with AI to process the voice order
      };
      
      recognition.onerror = () => {
        toast({
          title: "Voice recognition error",
          description: "Please try again or use manual ordering",
          variant: "destructive",
        });
      };
      
      recognition.onend = () => {
        setIsListening(false);
      };
      
      recognition.start();
    } else {
      toast({
        title: "Voice ordering not supported",
        description: "Your browser doesn't support voice recognition",
        variant: "destructive",
      });
    }
  };

  const placeOrder = () => {
    if (!table || cart.length === 0) return;

    createOrderMutation.mutate({
      tableId: table.id,
      items: cart.map(item => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        notes: item.notes,
      })),
      notes: orderNotes,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!table && tableId !== "demo") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Table Not Found</h1>
          <p className="text-gray-600">The QR code you scanned is invalid or the table is not active.</p>
        </div>
      </div>
    );
  }

  const displayTableNumber = table?.number || "Demo";

  return (
    <div className="min-h-screen bg-gray-50 pb-32">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-primary">SnapServe</span>
              <span className="ml-2 text-sm text-gray-600">Bella Vista</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleVoiceOrder}
                className={isListening ? "voice-indicator" : ""}
              >
                <Mic className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm">
                <QrCode className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Welcome Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <img 
            src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400" 
            alt="Restaurant interior" 
            className="w-full h-48 object-cover rounded-lg mb-4"
          />
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Table <span className="text-primary">{displayTableNumber}</span>
              </h1>
              <p className="text-gray-600">Welcome to Bella Vista</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                ~20 min
              </Badge>
            </div>
          </div>
          
          {/* AI Recommendation Banner */}
          {recommendations.recommendations?.length > 0 && (
            <div className="bg-gradient-to-r from-accent/10 to-primary/10 rounded-lg p-4 border border-accent/20">
              <div className="flex items-center">
                <Sparkles className="h-5 w-5 text-accent mr-2" />
                <span className="text-sm font-medium text-gray-800">
                  AI Recommendation: {recommendations.recommendations[0].name}
                </span>
                <Button variant="ghost" size="sm" className="ml-auto text-primary">
                  View →
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Category Filters */}
        <div className="flex space-x-3 overflow-x-auto pb-2 mb-6">
          <Button
            variant={selectedCategory === null ? "default" : "outline"}
            onClick={() => setSelectedCategory(null)}
            className="whitespace-nowrap"
          >
            All
          </Button>
          {menu.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
              className="whitespace-nowrap"
            >
              {category.name}
            </Button>
          ))}
        </div>

        {/* Menu Items */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
          {menu
            .filter(category => selectedCategory === null || category.id === selectedCategory)
            .flatMap(category => category.items)
            .map((item) => (
              <MenuItemCard 
                key={item.id} 
                item={item} 
                onAddToCart={addToCart}
              />
            ))}
        </div>

        {/* Upsell Suggestions */}
        {upsellSuggestions.suggestions?.length > 0 && (
          <div className="bg-gradient-to-r from-primary/5 to-accent/5 rounded-xl p-6 border border-primary/10 mb-8">
            <div className="flex items-center mb-4">
              <Sparkles className="h-5 w-5 text-primary mr-2" />
              <h3 className="text-lg font-semibold text-gray-900">Complete Your Meal</h3>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {upsellSuggestions.suggestions.slice(0, 2).map((suggestion: any, index: number) => (
                <div key={index} className="bg-white rounded-lg p-4 text-center shadow-sm">
                  <p className="text-sm font-medium">{suggestion.name}</p>
                  <p className="text-primary font-bold">${suggestion.price}</p>
                  <Button size="sm" className="mt-2">Add</Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cart Summary */}
        {cart.length > 0 && (
          <div className="fixed bottom-20 left-4 right-4 md:static md:mt-8 bg-white rounded-xl shadow-lg border border-gray-200 z-30">
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Your Order</h3>
              
              <div className="space-y-3 mb-4 max-h-40 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.menuItemId} className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{item.name}</p>
                      <p className="text-xs text-gray-600">${item.price} each</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateCartItemQuantity(item.menuItemId, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateCartItemQuantity(item.menuItemId, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <Textarea
                  placeholder="Any special requests or allergies?"
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="mb-4"
                  rows={2}
                />
                
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">Total ({cartItemCount} items)</p>
                    <p className="text-xl font-bold text-primary">${cartTotal.toFixed(2)}</p>
                  </div>
                  <Button 
                    onClick={placeOrder}
                    disabled={createOrderMutation.isPending}
                    className="px-6"
                  >
                    {createOrderMutation.isPending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Placing Order...
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Place Order
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <FloatingChat />
    </div>
  );
}
