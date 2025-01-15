"use client";

import { ReactNode, useEffect } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter } from "next/navigation";
import { MainSidebar } from "@/components/sidebar/main-sidebar";
import { UserNav } from "@/components/layout/header/user-nav";
import { Calendar } from "lucide-react";
import { HeaderWrapper } from "@/components/layout/header/header-wrapper";

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  // Prevent body scrolling
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-foreground">
        <p className="text-xl font-semibold">Loading secure content...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <HeaderWrapper />

      <div className="flex flex-1 min-h-0">
        {/* Sidebar with custom scrollbar */}
        <aside className="w-64 border-r flex-shrink-0">
          <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-background hover:scrollbar-thumb-muted-foreground/50">
            <MainSidebar />
          </div>
        </aside>

        {/* Main content area */}
        <main className="flex-1 relative">
          <div className="absolute inset-0">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}