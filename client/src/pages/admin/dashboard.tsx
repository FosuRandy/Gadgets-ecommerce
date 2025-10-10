import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { DollarSign, ShoppingCart, Package, Users, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { AnalyticsData, Product, Order } from "@shared/schema";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

export default function AdminDashboard() {
  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics"],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-4" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const stats = [
    {
      title: "Total Revenue",
      value: `GH₵${analytics.totalRevenue.toFixed(2)}`,
      change: analytics.revenueChange,
      icon: DollarSign,
      testId: "stat-revenue"
    },
    {
      title: "Total Orders",
      value: analytics.totalOrders.toString(),
      change: analytics.ordersChange,
      icon: ShoppingCart,
      testId: "stat-orders"
    },
    {
      title: "Total Products",
      value: analytics.totalProducts.toString(),
      change: 0,
      icon: Package,
      testId: "stat-products"
    },
    {
      title: "Total Customers",
      value: analytics.totalCustomers.toString(),
      change: 0,
      icon: Users,
      testId: "stat-customers"
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">Overview of your store performance</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} data-testid={stat.testId}>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold" data-testid={`${stat.testId}-value`}>{stat.value}</div>
              {stat.change !== 0 && (
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  {stat.change > 0 ? (
                    <>
                      <TrendingUp className="h-3 w-3 text-chart-3" />
                      <span className="text-chart-3">+{stat.change}%</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-3 w-3 text-destructive" />
                      <span className="text-destructive">{stat.change}%</span>
                    </>
                  )}
                  <span>from last month</span>
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.salesByCategory}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="category" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '6px'
                  }}
                />
                <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topProducts.slice(0, 5).map((item, index) => (
                <div key={item.product.id} className="flex items-center gap-4" data-testid={`top-product-${index}`}>
                  <div className="h-12 w-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
                    <img src={item.product.image} alt={item.product.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{item.product.name}</p>
                    <p className="text-sm text-muted-foreground">{item.units} units sold</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">GH₵{item.revenue.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {analytics.lowStockProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-chart-4" />
              Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {analytics.lowStockProducts.map((product) => (
                <div key={product.id} className="flex items-center gap-3 p-3 rounded-md border" data-testid={`low-stock-${product.id}`}>
                  <div className="h-12 w-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
                    <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{product.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={product.stock === 0 ? "destructive" : "secondary"} className="text-xs">
                        {product.stock === 0 ? "Out of Stock" : `${product.stock} left`}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics.recentOrders.slice(0, 5).map((order) => (
              <div key={order.id} className="flex items-center justify-between p-3 rounded-md border" data-testid={`recent-order-${order.id}`}>
                <div className="flex-1">
                  <p className="font-medium">{order.customerName}</p>
                  <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
                </div>
                <div className="flex items-center gap-4">
                  <Badge
                    variant={
                      order.status === "delivered" ? "default" :
                      order.status === "cancelled" ? "destructive" :
                      "secondary"
                    }
                  >
                    {order.status}
                  </Badge>
                  <p className="font-bold">GH₵{parseFloat(order.total).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
