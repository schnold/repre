"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { cn } from "@/lib/utils";
import {
  Home,
  UserPlus,
  Users,
  Book,
  Settings,
  BarChart2,
  HelpCircle,
} from "lucide-react";

export default function MainSidebar() {
  const pathname = usePathname();
  const { hasRole } = useAuth();

  const navItems = [
    {
      name: "Home",
      href: "/dashboard",
      icon: Home,
      roles: ["admin", "editor", "viewer"],
    },
    {
      name: "Calendar",
      href: "/calendar",
      icon: Book,
      roles: ["admin", "editor", "viewer"],
    },
    {
      name: "Representation",
      href: "/representation",
      icon: Users,
      roles: ["admin", "editor"],
    },
    {
      name: "Reports",
      href: "/reports",
      icon: BarChart2,
      roles: ["admin", "editor"],
    },
    {
      name: "Teachers",
      href: "/teachers",
      icon: UserPlus,
      roles: ["admin"],
    },
    {
      name: "Analytics",
      href: "/dashboard/analytics",
      icon: BarChart2,
      roles: ["admin", "editor", "viewer"],
    },
    {
      name: "Settings",
      href: "/settings",
      icon: Settings,
      roles: ["admin", "editor", "viewer"],
    },
  ];

  return (
    <nav className="flex flex-col h-full p-4 bg-white text-gray-800">
      {/* Logo / Brand at top */}
      <div className="mb-6 text-center">
        <Link href="/" className="inline-block">
          <div className="text-2xl font-extrabold text-brand-600 tracking-tight">
            Repre
          </div>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="space-y-1 flex-1">
        {navItems.map((item) => {
          if (!hasRole(item.roles)) return null;
          const active = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group flex items-center gap-2 px-3 py-2 rounded-md font-medium transition-colors",
                active
                  ? "bg-brand-50 text-brand-700 shadow-sm"
                  : "text-gray-700 hover:bg-gray-100 hover:shadow-sm"
              )}
            >
              <Icon className="h-5 w-5 shrink-0 text-gray-500 group-hover:text-brand-600" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Maybe a bottom link for Help */}
      <div className="pt-4 border-t mt-4">
        <Link
          href="/help"
          className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-gray-500 transition-colors hover:bg-gray-100 hover:shadow-sm"
        >
          <HelpCircle className="h-4 w-4" />
          <span>Help & Support</span>
        </Link>
      </div>
    </nav>
  );
}
