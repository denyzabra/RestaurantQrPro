import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Plus, Leaf, AlertTriangle } from "lucide-react";

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: string;
  imageUrl?: string;
  isPopular: boolean;
  allergens?: string[];
}

interface MenuItemCardProps {
  item: MenuItem;
  onAddToCart: (item: MenuItem, quantity?: number) => void;
}

export default function MenuItemCard({ item, onAddToCart }: MenuItemCardProps) {
  const hasAllergens = item.allergens && item.allergens.length > 0;
  const isVegetarian = item.description.toLowerCase().includes('vegetarian') || 
                      item.description.toLowerCase().includes('veggie');
  const isVegan = item.description.toLowerCase().includes('vegan');

  return (
    <Card className="overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
      {/* Image */}
      <div className="relative overflow-hidden">
        {item.imageUrl ? (
          <img 
            src={item.imageUrl} 
            alt={item.name}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-sm">No image available</span>
          </div>
        )}
        
        {/* Badges Overlay */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          {item.isPopular && (
            <Badge className="bg-accent text-accent-foreground flex items-center">
              <Star className="h-3 w-3 mr-1 fill-current" />
              Popular
            </Badge>
          )}
          {isVegan && (
            <Badge variant="secondary" className="bg-green-100 text-green-800 flex items-center">
              <Leaf className="h-3 w-3 mr-1" />
              Vegan
            </Badge>
          )}
          {isVegetarian && !isVegan && (
            <Badge variant="secondary" className="bg-green-100 text-green-800 flex items-center">
              <Leaf className="h-3 w-3 mr-1" />
              Vegetarian
            </Badge>
          )}
        </div>

        {/* Price Overlay */}
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="bg-white/90 text-gray-900 font-bold">
            ${item.price}
          </Badge>
        </div>
      </div>

      <CardContent className="p-4">
        <div className="mb-3">
          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
            {item.name}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed">
            {item.description}
          </p>
        </div>

        {/* Allergens */}
        {hasAllergens && (
          <div className="mb-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center text-yellow-800">
              <AlertTriangle className="h-4 w-4 mr-2" />
              <span className="text-xs font-medium">
                Contains: {item.allergens!.join(', ')}
              </span>
            </div>
          </div>
        )}

        {/* Add to Cart Button */}
        <Button 
          onClick={() => onAddToCart(item)}
          className="w-full group-hover:bg-primary/90 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add to Cart • ${item.price}
        </Button>
      </CardContent>
    </Card>
  );
}
