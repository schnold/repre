// src/components/layout/header/main-nav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useUser } from '@auth0/nextjs-auth0/client';
import { UserProfile } from '@auth0/nextjs-auth0/client';

interface NavItem {
  name: string;
  href: string;
}

interface ExtendedUserProfile extends UserProfile {
  'https://repre.io/roles'?: string[];
  email: string;
  name?: string;
  sub: string;
}

const getRoleBasedNavigation = (roles: string[]): NavItem[] => {
  // Default items everyone can see
  const baseItems: NavItem[] = [
    { name: "Dashboard", href: "/dashboard" },
  ];

  if (roles.includes('admin')) {
    return [
      ...baseItems,
      { name: "Calendar", href: "/calendar" },
      { name: "Teachers", href: "/teachers" },
      { name: "Organizations", href: "/organizations" },
      { name: "Settings", href: "/settings" },
    ];
  }

  if (roles.includes('schoolAdmin')) {
    return [
      ...baseItems,
      { name: "Calendar", href: "/calendar" },
      { name: "Teachers", href: "/teachers" },
      { name: "Settings", href: "/settings" },
    ];
  }

  if (roles.includes('teacher')) {
    return [
      ...baseItems,
      { name: "Calendar", href: "/calendar" },
      { name: "My Schedule", href: "/schedule" },
    ];
  }

  if (roles.includes('substitute')) {
    return [
      ...baseItems,
      { name: "Available Jobs", href: "/substitutions" },
      { name: "My Schedule", href: "/schedule" },
    ];
  }

  return baseItems;
};

export function MainNav() {
  const pathname = usePathname();
  const { user } = useUser();
  
  const auth0User = user as ExtendedUserProfile | undefined;
  const roles = auth0User?.['https://repre.io/roles'] || [];
  const navigationItems = getRoleBasedNavigation(roles);

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6">
      {navigationItems.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className={cn(
            "text-sm font-medium transition-colors hover:text-primary",
            pathname === item.href
              ? "text-primary"
              : "text-muted-foreground"
          )}
        >
          {item.name}
        </Link>
      ))}
    </nav>
  );
}