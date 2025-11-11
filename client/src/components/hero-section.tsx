import { Button } from "@/components/ui/button";
import { ShoppingBag, Truck, Shield, Headphones } from "lucide-react";
import heroImage from "@assets/stock_images/ecommerce_shopping_o_40d6562b.jpg";

export function HeroSection() {
  const scrollToProducts = () => {
    document.getElementById("products")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="relative">
      <div className="relative h-[500px] md:h-[600px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/30 z-10" />
        <img
          src={heroImage}
          alt="Shop the latest products"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="relative z-20 container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl text-white space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Discover Amazing Products at Unbeatable Prices
            </h1>
            <p className="text-lg md:text-xl text-white/90">
              Shop the latest electronics and more.
            </p>
            <div className="flex gap-4 flex-wrap">
              <Button
                size="lg"
                onClick={scrollToProducts}
                className="bg-primary/90 backdrop-blur hover:bg-primary"
                data-testid="button-shop-now"
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                Shop Now
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="bg-white/10 backdrop-blur border-white/30 text-white hover:bg-white/20"
                data-testid="button-explore"
              >
                Explore Categories
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="border-b bg-card">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="font-semibold">Quality Services</div>
                <div className="text-sm text-muted-foreground">Delivery withing Accra</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="font-semibold">Secure Payment</div>
                <div className="text-sm text-muted-foreground">100% protected</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center">
                <Headphones className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="font-semibold">24/7 Support</div>
                <div className="text-sm text-muted-foreground">Always here to help</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-md bg-primary/10 flex items-center justify-center">
                <ShoppingBag className="h-6 w-6 text-primary" />
              </div>
              <div>
                <div className="font-semibold">Easy Returns</div>
                <div className="text-sm text-muted-foreground">30-day guarantee</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
