"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  FolderKanban, 
  Target, 
  Settings, 
  LogOut,
  Home,
  BarChart3,
  Users,
  Bell,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ isMobileOpen, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const params = useParams();
  const workspaceId = params?.workspaceId as string;
  const { data: session } = useSession();

  const navigation = [
    { name: "Home", href: "/dashboard", icon: Home },
    { name: "Boards", href: workspaceId ? `/dashboard/workspaces/${workspaceId}` : "/dashboard", icon: FolderKanban, disabled: !workspaceId },
    { name: "Dashboards", href: workspaceId ? `/dashboard/workspaces/${workspaceId}/dashboards` : "/dashboard", icon: BarChart3, disabled: !workspaceId },
    { name: "Goals", href: workspaceId ? `/dashboard/workspaces/${workspaceId}/goals` : "/dashboard", icon: Target, disabled: !workspaceId },
    { name: "Team", href: workspaceId ? `/dashboard/workspaces/${workspaceId}/team` : "/dashboard", icon: Users, disabled: !workspaceId },
  ];

  const handleNavClick = () => {
    // Close mobile menu when navigating
    onMobileClose?.();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "flex flex-col h-full bg-card border-r w-64 transition-transform duration-200",
        "fixed md:relative z-50 md:z-auto",
        "md:translate-x-0",
        isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-6 border-b">
          <Link href="/dashboard" className="flex items-center space-x-2" onClick={handleNavClick}>
            <LayoutDashboard className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">
              Work<span className="text-primary">OS</span>
            </span>
          </Link>
          {/* Mobile close button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onMobileClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
            const isDisabled = 'disabled' in item && item.disabled;
            
            if (isDisabled) {
              return (
                <div
                  key={item.name}
                  className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-muted-foreground/50 cursor-not-allowed"
                  title="Create a workspace first"
                >
                  <item.icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </div>
              );
            }
            
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleNavClick}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User section */}
        <div className="border-t p-4">
          <div className="flex items-center space-x-3 mb-3">
            <div className="flex-shrink-0">
              {session?.user?.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || "User"}
                  className="h-10 w-10 rounded-full"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold">
                  {session?.user?.name?.[0] || "U"}
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                {session?.user?.name || "User"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {session?.user?.email}
              </p>
            </div>
          </div>
          <div className="space-y-2">
            <Link href="/dashboard/settings">
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </Link>
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
              size="sm"
              onClick={() => signOut({ callbackUrl: "/" })}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
