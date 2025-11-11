import {
  Package,
  ShoppingCart,
  Users,
  BarChart3,
  Settings,
  Boxes,
  Tag,
  UserCog,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/lib/auth-context";

interface MenuItem {
  title: string;
  url: string;
  icon: any;
  roles?: string[]; // If specified, only show for these roles
}

const menuItems: MenuItem[] = [
  {
    title: "Analytics",
    url: "/admin",
    icon: BarChart3,
  },
  {
    title: "Products",
    url: "/admin/products",
    icon: Package,
    roles: ["super_admin", "vendor"], // Only super admins and vendors can manage products
  },
  {
    title: "Inventory",
    url: "/admin/inventory",
    icon: Boxes,
    roles: ["super_admin", "vendor"],
  },
  {
    title: "Orders",
    url: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    title: "Customers",
    url: "/admin/customers",
    icon: Users,
    roles: ["super_admin", "support_agent"],
  },
  {
    title: "Promotions",
    url: "/admin/promotions",
    icon: Tag,
    roles: ["super_admin"],
  },
  {
    title: "User Management",
    url: "/admin/users",
    icon: UserCog,
    roles: ["super_admin"],
  },
  {
    title: "Settings",
    url: "/admin/settings",
    icon: Settings,
  },
];

export function AdminSidebar() {
  const [location] = useLocation();
  const { user } = useAuth();

  const visibleMenuItems = menuItems.filter((item) => {
    if (!item.roles) return true; // Show to all if no roles specified
    return user && item.roles.includes(user.role);
  });

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Admin Dashboard</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={location === item.url}
                    data-testid={`link-admin-${item.title.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <Link href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
