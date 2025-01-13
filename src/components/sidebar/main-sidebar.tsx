"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useOrganizations } from "@/hooks/use-organizations";
import { usePathname, useRouter } from "next/navigation";
import { 
  Calendar, 
  Users, 
  Settings,
  LayoutDashboard,
  CalendarDays,
  CalendarRange,
  CalendarClock,
  Building2
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { OrganizationSelector } from "@/components/organization-selector";
import { Separator } from "@/components/ui/separator";

export function MainSidebar() {
  const { currentOrg } = useOrganizations();
  const pathname = usePathname();
  const router = useRouter();

  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
    {
      title: "Teachers",
      icon: Users,
      path: "/teachers",
    },
    {
      title: "Calendar",
      icon: Calendar,
      path: "/calendar",
    },
  ];

  const scheduleViews = [
    {
      title: "Day View",
      icon: CalendarClock,
      path: "/schedule/day",
    },
    {
      title: "Week View",
      icon: CalendarDays,
      path: "/schedule/week",
    },
    {
      title: "Month View",
      icon: CalendarRange,
      path: "/schedule/month",
    },
  ];

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Main Menu Section */}
      <div className="flex-1 py-6">
        <div className="px-3 space-y-1">
          {menuItems.map((item) => (
            <Button
              key={item.title}
              variant="ghost"
              className={`w-full justify-start ${
                pathname === item.path 
                  ? "bg-primary/10 text-primary hover:bg-primary/20" 
                  : ""
              }`}
              onClick={() => handleNavigation(item.path)}
            >
              <item.icon className="mr-2 h-4 w-4" />
              {item.title}
            </Button>
          ))}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className={`w-full justify-start ${
                  pathname?.startsWith('/schedule') 
                    ? "bg-primary/10 text-primary hover:bg-primary/20" 
                    : ""
                }`}
              >
                <Calendar className="mr-2 h-4 w-4" />
                Schedule
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {scheduleViews.map((view) => (
                <DropdownMenuItem
                  key={view.title}
                  onClick={() => handleNavigation(view.path)}
                >
                  <view.icon className="mr-2 h-4 w-4" />
                  {view.title}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Bottom Section with Organization and Settings */}
      <div className="mt-auto border-t">
        {/* Organization Selector */}
        <div className="p-4">
          <div className="flex items-center gap-2 text-sm font-medium mb-2">
            <Building2 className="h-4 w-4" />
            <span>Organization</span>
          </div>
          <OrganizationSelector />
        </div>

        {/* Settings */}
        <div className="p-3 border-t">
          <Button
            variant="ghost"
            className={`w-full justify-start ${
              pathname?.startsWith('/settings') 
                ? "bg-primary/10 text-primary hover:bg-primary/20" 
                : ""
            }`}
            onClick={() => handleNavigation('/settings')}
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        </div>
      </div>
    </div>
  );
}