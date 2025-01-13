"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { OrganizationSelector } from "./organization-selector";
import { Building2, LogOut, Settings, User } from "lucide-react";
import Link from "next/link";

export function Header() {
  const { user } = useUser();

  return (
    <header className="border-b">
      <div className="flex h-16 items-center px-4 gap-8">
        {/* Logo - Left */}
        <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
          <Building2 className="h-5 w-5" />
          <span className="tracking-tight">Calendar App</span>
        </Link>

        {/* Organization Selector - Center */}
        <div className="flex-1 flex justify-center">
          <div className="w-[200px]">
            <OrganizationSelector />
          </div>
        </div>

        {/* User Menu - Right */}
        <div className="flex items-center ">
          {user ? (
            <DropdownMenu >
                
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.picture || undefined} alt={user.name || "User"} />
                    <AvatarFallback className="bg-muted">
                      {user.name?.charAt(0).toUpperCase() || "U"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-slate-800/70 backdrop-blur-md">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/settings/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings/organization" className="cursor-pointer">
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link 
                    href="/api/auth/logout" 
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="default">
              <Link href="/api/auth/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
} 