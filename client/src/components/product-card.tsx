import { Star, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Product } from "@shared/schema";
import { useCart } from "@/lib/cart-context";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const { toast } = useToast();
  const hasDiscount = product.originalPrice && parseFloat(product.originalPrice) > parseFloat(product.price);
  const discountPercent = hasDiscount
    ? Math.round(((parseFloat(product.originalPrice!) - parseFloat(product.price)) / parseFloat(product.originalPrice!)) * 100)
    : 0;

  const handleAddToCart = () => {
    addItem(product);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  return (
    <Card className="group overflow-hidden hover-elevate" data-testid={`card-product-${product.id}`}>
      <CardContent className="p-0">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
          {hasDiscount && (
            <Badge className="absolute top-2 right-2" variant="destructive" data-testid={`badge-discount-${product.id}`}>
              -{discountPercent}%
            </Badge>
          )}
          {product.stock <= product.lowStockThreshold && product.stock > 0 && (
            <Badge className="absolute top-2 left-2 bg-chart-4 text-white" data-testid={`badge-low-stock-${product.id}`}>
              Low Stock
            </Badge>
          )}
          {product.stock === 0 && (
            <Badge className="absolute top-2 left-2" variant="secondary" data-testid={`badge-out-stock-${product.id}`}>
              Out of Stock
            </Badge>
          )}
        </div>
        
        <div className="p-4 space-y-3">
          <div className="space-y-1">
            <h3 className="font-medium line-clamp-2 min-h-[3rem]" data-testid={`text-product-name-${product.id}`}>
              {product.name}
            </h3>
            <div className="flex items-center gap-1">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < Math.floor(parseFloat(product.rating || "0"))
                        ? "fill-primary text-primary"
                        : "text-muted-foreground"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground" data-testid={`text-review-count-${product.id}`}>
                ({product.reviewCount || 0})
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-lg font-bold" data-testid={`text-price-${product.id}`}>
              GH₵{parseFloat(product.price).toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-sm text-muted-foreground line-through" data-testid={`text-original-price-${product.id}`}>
                GH₵{parseFloat(product.originalPrice!).toFixed(2)}
              </span>
            )}
          </div>

          <Button
            className="w-full gap-2"
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            data-testid={`button-add-cart-${product.id}`}
          >
            <ShoppingCart className="h-4 w-4" />
            {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
