"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import { UserRole } from "@/lib/types/auth";
import {
  LayoutDashboard,
  Calendar,
  UserPlus,
  Users,
  FileSpreadsheet,
  Settings,
  BarChart2,
  HelpCircle,
  School,
} from "lucide-react";

interface NavItem {
  name: string;
  href: string;
  icon: React.ElementType;
  roles: UserRole[];
}

export default function MainSidebar() {
  const pathname = usePathname();
  const { hasRole, user, roles } = useAuth();

  // Debug information
  console.log('MainSidebar Debug:', {
    user,
    roles,
    pathname
  });

  const navItems: NavItem[] = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["admin", "editor", "viewer"],
    },
    {
      name: "Calendar",
      href: "/calendar",
      icon: Calendar,
      roles: ["admin", "editor", "viewer"],
    },
    {
      name: "Representation",
      href: "/representation",
      icon: FileSpreadsheet,
      roles: ["admin"],
    },
    {
      name: "Teachers",
      href: "/teachers",
      icon: UserPlus,
      roles: ["admin"],
    },
    {
      name: "Substitutions",
      href: "/substitutions",
      icon: Users,
      roles: ["admin", "editor"],
    },
    {
      name: "Reports",
      href: "/reports",
      icon: FileSpreadsheet,
      roles: ["admin", "editor"],
    },
    {
      name: "Analytics",
      href: "/dashboard/analytics",
      icon: BarChart2,
      roles: ["admin", "editor"],
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
      roles: ["admin", "editor"],
    },
    {
      name: "Schools",
      href: "/schools",
      icon: School,
      roles: ["admin"],
    },
  ];

  // If no user yet, show loading state
  if (!user) {
    return (
      <div className="flex flex-col h-full p-4 bg-white text-gray-800">
        <div className="mb-6">
          <span className="text-2xl font-extrabold text-brand-600 tracking-tight">
            Repre
          </span>
        </div>
        <div className="animate-pulse space-y-4">
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="h-10 bg-gray-200 rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <nav className="flex flex-col h-full p-4 bg-white text-gray-800">
      {/* Logo / Brand */}
      <div className="mb-6">
        <Link href="/dashboard" className="flex items-center">
          <span className="text-2xl font-extrabold text-brand-600 tracking-tight">
            Repre
          </span>
        </Link>
      </div>

      {/* Debug Info - Remove in production */}
      <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
        <div>User: {user.email}</div>
        <div>Roles: {roles.length > 0 ? roles.join(', ') : 'No roles'}</div>
      </div>

      {/* Navigation Items */}
      <div className="space-y-1 flex-1">
        {navItems.map((item) => {
          // Debug each menu item's role check
          const hasRequiredRole = hasRole(item.roles);
          console.log(`Menu item "${item.name}"`, {
            requiredRoles: item.roles,
            hasRole: hasRequiredRole
          });

          if (!hasRequiredRole) return null;

          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-brand-50 text-brand-700 shadow-sm"
                  : "text-gray-700 hover:bg-gray-100 hover:text-brand-600"
              )}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Help Link at Bottom */}
      <div className="pt-4 border-t mt-4">
        <Link
          href="/help"
          className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-gray-600 hover:bg-gray-100 hover:text-brand-600 transition-colors"
        >
          <HelpCircle className="h-5 w-5 shrink-0" />
          <span>Help & Support</span>
        </Link>
      </div>
    </nav>
  );
}