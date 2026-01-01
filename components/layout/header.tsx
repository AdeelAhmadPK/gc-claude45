"use client";

import { Bell, Settings, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlobalSearch } from "./global-search";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationsPopover } from "@/components/notifications-popover";
import { useRouter } from "next/navigation";

export function Header() {
  const router = useRouter();

  return (
    <header className="hidden md:block h-14 lg:h-16 border-b bg-card">
      <div className="flex items-center justify-between h-full px-4 lg:px-6">
        <div className="flex-1 max-w-md lg:max-w-2xl">
          <GlobalSearch />
        </div>
        
        <div className="flex items-center gap-1 lg:gap-2">
          <NotificationsPopover />
          
          <Button variant="ghost" size="icon" title="Help" className="hidden lg:flex">
            <HelpCircle className="h-5 w-5" />
          </Button>
          
          <ThemeToggle />
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => router.push('/dashboard/settings')}
            title="Settings"
          >
            <Settings className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
