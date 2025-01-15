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
  Building2,
  ChevronDown
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

export function MainSidebar() {
  const { organizations, currentOrg, setCurrentOrg } = useOrganizations();
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
    {
      title: "Organizations",
      icon: Building2,
      path: "/organizations",
    },
  ];

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Navigation Menu - Scrollable */}
      <div className="flex-1 overflow-y-auto">
        <nav className="px-3 py-4 space-y-1">
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
        </nav>
      </div>

      {/* Fixed bottom section */}
      <div className="flex-shrink-0 border-t p-4 space-y-4">
        {/* Organization Selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-full justify-between">
              <div className="flex items-center">
                <Building2 className="mr-2 h-4 w-4" />
                <span className="truncate">
                  {currentOrg?.name || "Select Organization"}
                </span>
              </div>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-[200px]" align="end">
            <DropdownMenuLabel>Organizations</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {organizations?.map((org) => (
              <DropdownMenuItem
                key={org._id.toString()}
                onClick={() => setCurrentOrg(org)}
                className="cursor-pointer"
              >
                {org.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Settings */}
        <Button
          variant="ghost"
          className={`w-full justify-start ${
            pathname === '/settings' 
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
  );
}