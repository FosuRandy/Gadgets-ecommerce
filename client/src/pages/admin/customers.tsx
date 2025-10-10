import { useQuery } from "@tanstack/react-query";
import { Search, Mail, Phone } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import type { Order } from "@shared/schema";

interface CustomerData {
  name: string;
  email: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
}

export default function AdminCustomers() {
  const [search, setSearch] = useState("");

  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ["/api/orders"],
  });

  const customers: CustomerData[] = Object.values(
    orders.reduce((acc, order) => {
      const key = order.customerEmail;
      if (!acc[key]) {
        acc[key] = {
          name: order.customerName,
          email: order.customerEmail,
          phone: order.customerPhone,
          totalOrders: 0,
          totalSpent: 0,
        };
      }
      acc[key].totalOrders++;
      acc[key].totalSpent += parseFloat(order.total);
      return acc;
    }, {} as Record<string, CustomerData>)
  );

  const filteredCustomers = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
        <p className="text-muted-foreground">Manage customer accounts</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search customers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
          data-testid="input-search-customers"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {filteredCustomers.map((customer, index) => (
          <Card key={customer.email} data-testid={`customer-card-${index}`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarFallback>{customer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 space-y-2">
                  <div>
                    <h3 className="font-semibold">{customer.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Mail className="h-3 w-3 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground truncate">{customer.email}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <Phone className="h-3 w-3 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">{customer.phone}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 pt-2 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground">Total Orders</p>
                      <p className="font-bold">{customer.totalOrders}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Total Spent</p>
                      <p className="font-bold">GH₵{customer.totalSpent.toFixed(2)}</p>
                    </div>
                    <Badge variant="default">Customer</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredCustomers.length === 0 && (
          <div className="col-span-2 text-center py-12 text-muted-foreground">
            No customers found
          </div>
        )}
      </div>
    </div>
  );
}
