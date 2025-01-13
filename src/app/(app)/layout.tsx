// FILE: src/app/(app)/layout.tsx
"use client";

import { ReactNode, useEffect } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter } from "next/navigation";
import { MainSidebar } from "@/components/sidebar/main-sidebar";
import { UserNav } from "@/components/layout/header/user-nav";

export default function AppLayout({ children }: { children: ReactNode }) {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return (
      <div className="flex items-center justify-center h-screen bg-background text-foreground">
        <p className="text-xl font-semibold">Loading secure content...</p>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex overflow-hidden bg-background">
      {/* Fixed sidebar */}
      <aside className="w-64 flex-shrink-0 border-r">
        <MainSidebar />
      </aside>

      {/* Scrollable main content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Fixed header */}
        <header className="h-16 flex-shrink-0 border-b bg-background">
          <div className="flex h-full items-center justify-between px-4">
            <div className="font-semibold text-lg">Calendar App</div>
            <UserNav />
          </div>
        </header>

        {/* Scrollable content area */}
        <div className="flex-1 overflow-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
