
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { EggIcon } from "@/components/icons/EggIcon";
import { FeedIcon } from "@/components/icons/FeedIcon";
import { BirdIcon } from "@/components/icons/BirdIcon";
import { LayoutDashboard, FileText, Lightbulb, Settings2, Users, ListChecks, ShoppingCart } from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/inventory", label: "Inventory", icon: FeedIcon },
  { href: "/egg-production", label: "Egg Production", icon: EggIcon },
  { href: "/mortality", label: "Mortality Tracking", icon: BirdIcon },
  { href: "/tasks", label: "Task Management", icon: ListChecks },
  { href: "/sales", label: "Sales Tracking", icon: ShoppingCart },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/optimize", label: "AI Optimizer", icon: Lightbulb },
  { href: "/settings", label: "Settings", icon: Settings2 },
  { href: "/users", label: "User Management", icon: Users },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <SidebarMenu>
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== "/dashboard") || (item.href === "/dashboard" && pathname === "/");
        
        return (
          <SidebarMenuItem key={item.href}>
            <Link href={item.href}>
              <SidebarMenuButton
                variant="default"
                className={cn(
                  "w-full justify-start",
                  isActive && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                )}
                isActive={isActive}
                tooltip={item.label}
              >
                <Icon className="h-5 w-5" />
                <span className="truncate group-data-[collapsible=icon]:hidden">{item.label}</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
