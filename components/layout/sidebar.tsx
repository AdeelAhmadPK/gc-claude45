"use client";

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
  Bell
} from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();
  const params = useParams();
  const workspaceId = params?.workspaceId as string;
  const { data: session } = useSession();

  const navigation = workspaceId ? [
    { name: "Home", href: "/dashboard", icon: Home },
    { name: "Boards", href: `/dashboard/workspaces/${workspaceId}`, icon: FolderKanban },
    { name: "Dashboards", href: `/dashboard/workspaces/${workspaceId}/dashboards`, icon: BarChart3 },
    { name: "Goals", href: `/dashboard/workspaces/${workspaceId}/goals`, icon: Target },
    { name: "Team", href: `/dashboard/workspaces/${workspaceId}/team`, icon: Users },
  ] : [
    { name: "Home", href: "/dashboard", icon: Home },
  ];

  return (
    <div className="flex flex-col h-full bg-card border-r w-64">
      {/* Logo */}
      <div className="flex items-center h-16 px-6 border-b">
        <Link href="/dashboard" className="flex items-center space-x-2">
          <LayoutDashboard className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">
            Work<span className="text-primary">OS</span>
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
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
  );
}
