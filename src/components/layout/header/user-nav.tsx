import { useUser } from "@auth0/nextjs-auth0/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { User, Settings, LogOut, Bell } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCalendarStore } from "@/store/calendar-store";
import { useTeacherStore } from "@/store/teacher-store";

export function UserNav() {
  const { user } = useUser();
  const router = useRouter();
  const resetCalendar = useCalendarStore((state) => state.clearEvents);
  const resetTeachers = useTeacherStore((state) => state.clearTeachers);

  const handleLogout = async () => {
    try {
      // Clear all client-side state before logout
      resetCalendar();
      resetTeachers();
      
      // Clear any local storage
      localStorage.clear();
      sessionStorage.clear();
      
      // Use the Auth0 SDK logout endpoint
      window.location.assign('/api/auth/logout');
    } catch (error) {
      console.error("Logout failed:", error);
      // If logout fails, at least try to redirect to landing
      router.push('/landing');
    }
  };

  return (
    <div className="flex items-center gap-4">
      <Button variant="ghost" size="icon" aria-label="Notifications">
        <Bell className="h-5 w-5" />
      </Button>

      <DropdownMenu
      
      >
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="relative h-8 w-8 rounded-full border border-gray-900 focus:outline-none"
            aria-label="User menu"
          >
            {user?.picture ? (
              <Image
                src={user.picture}
                alt={user.name || "User avatar"}
                width={32}
                height={32}
                className="rounded-full"
              />
            ) : (
              <User className="h-5 w-5" />
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {user?.name || "Guest User"}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email || "No email available"}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <Link href="/settings">
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
            </Link>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            className="text-red-600 focus:text-red-600 cursor-pointer" 
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}