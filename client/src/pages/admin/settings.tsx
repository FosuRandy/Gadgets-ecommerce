import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Store, Globe, DollarSign, Truck } from "lucide-react";

export default function AdminSettings() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Configure your store settings</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5" />
              Store Information
            </CardTitle>
            <CardDescription>Basic information about your store</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="store-name">Store Name</Label>
              <Input id="store-name" defaultValue="ShopHub" data-testid="input-store-name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-email">Contact Email</Label>
              <Input id="store-email" type="email" defaultValue="support@shophub.com" data-testid="input-store-email" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-phone">Contact Phone</Label>
              <Input id="store-phone" defaultValue="+1 (555) 123-4567" data-testid="input-store-phone" />
            </div>
            <Button data-testid="button-save-store-info">Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Currency & Pricing
            </CardTitle>
            <CardDescription>Configure currency and tax settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Default Currency</Label>
              <Input id="currency" defaultValue="GHS (Ghana Cedis)" data-testid="input-currency" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tax-rate">Tax Rate (%)</Label>
              <Input id="tax-rate" type="number" defaultValue="0" data-testid="input-tax-rate" />
            </div>
            <Button data-testid="button-save-pricing">Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5" />
              Shipping Settings
            </CardTitle>
            <CardDescription>Configure shipping options and rates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="free-shipping">Free Shipping Threshold</Label>
              <Input id="free-shipping" type="number" defaultValue="50" data-testid="input-free-shipping" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shipping-rate">Standard Shipping Rate</Label>
              <Input id="shipping-rate" type="number" step="0.01" defaultValue="5.99" data-testid="input-shipping-rate" />
            </div>
            <Button data-testid="button-save-shipping">Save Changes</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Website Settings
            </CardTitle>
            <CardDescription>Configure website content and appearance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="hero-title">Hero Section Title</Label>
              <Input id="hero-title" defaultValue="Discover Amazing Products at Unbeatable Prices" data-testid="input-hero-title" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="hero-subtitle">Hero Section Subtitle</Label>
              <Input id="hero-subtitle" defaultValue="Shop the latest electronics, fashion, home goods and more" data-testid="input-hero-subtitle" />
            </div>
            <Button data-testid="button-save-website">Save Changes</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
