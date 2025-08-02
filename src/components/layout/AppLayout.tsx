
"use client";

import React from "react";
import { useRouter } from "next/navigation";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarInset,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { SidebarNav } from "@/components/navigation/SidebarNav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { ThemeToggle } from "./ThemeToggle";

export function AppLayout({ children, user }: { children: React.ReactNode; user: User }) {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.refresh();
  };

  const getInitials = (user?: User) => {
    if (!user) return "U";
    
    // Prefer full_name from user_metadata for initials
    const fullName = user.user_metadata?.full_name;
    if (fullName && typeof fullName === 'string') {
        const names = fullName.split(' ').filter(Boolean); // Filter out empty strings
        if (names.length > 1) {
            // Use first letter of first and last name
            return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
        } else if (names.length === 1 && names[0].length > 1) {
             // Use first two letters of single name
            return names[0].substring(0, 2).toUpperCase();
        }
    }
    
    // Fallback to the first letter of the email
    return user.email ? user.email[0].toUpperCase() : "U";
  };
  
  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || "User";
  
  return (
    <SidebarProvider defaultOpen={true}>
      <SidebarRail />
      <Sidebar variant="sidebar" collapsible="icon" className="border-r">
        <SidebarHeader className="p-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-8 w-8 text-primary">
            <path d="M12 2C8.686 2 6 6.477 6 11c0 4.97 2.539 8.261 6 9.5 3.461-1.239 6-4.53 6-9.5C18 6.477 15.314 2 12 2z" />
          </svg>
          <div className="font-headline text-xl font-semibold text-primary group-data-[collapsible=icon]:hidden">
            Happy Chicks
          </div>
        </SidebarHeader>
        <SidebarContent className="p-2">
          <SidebarNav />
        </SidebarContent>
        <Separator className="my-2" />
        <SidebarFooter className="p-4 flex flex-col gap-2">
          <div className="flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
             <Avatar className="h-9 w-9">
              <AvatarImage src={user.user_metadata?.avatar_url} alt="User Avatar" />
              <AvatarFallback>{getInitials(user)}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
              <span className="text-sm font-medium text-sidebar-foreground">{displayName}</span>
              <span className="text-xs text-muted-foreground">{user.email}</span>
            </div>
          </div>
          <div className="flex items-center justify-between group-data-[collapsible=icon]:flex-col group-data-[collapsible=icon]:gap-2">
             <ThemeToggle />
            <Button variant="ghost" size="icon" className="text-sidebar-foreground hover:text-destructive" aria-label="Logout" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset className="flex flex-col min-h-screen">
        <header className="sticky top-0 z-10 flex h-14 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-6">
          <SidebarTrigger className="md:hidden" />
          <h1 className="font-headline text-lg font-semibold">Welcome to Happy Chicks</h1>
        </header>
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
         <footer className="border-t p-4 text-center text-xs text-muted-foreground">
            © {new Date().getFullYear()} Happy Chicks. All rights reserved.
          </footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
