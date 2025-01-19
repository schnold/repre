"use client";

import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Settings, 
  Calendar,
  BookOpen,
  Clock
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function TeachersLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  const menuItems = [
    {
      title: "Overview",
      icon: Users,
      href: "/teachers"
    },
    {
      title: "Settings",
      icon: Settings,
      href: "/teachers/settings"
    }
  ];

  return (
    <div className="flex flex-col space-y-6">
      <div className="border-b">
        <div className="flex h-16 items-center px-4">
          <div className="flex space-x-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              
              return (
                <Button
                  key={item.href}
                  variant={isActive ? "default" : "ghost"}
                  asChild
                >
                  <Link href={item.href}>
                    <Icon className="mr-2 h-4 w-4" />
                    {item.title}
                  </Link>
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {children}
    </div>
  );
} 