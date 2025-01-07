// FILE: src/app/(app)/layout.tsx
"use client";

import { ReactNode, useEffect } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter } from "next/navigation";
import MainSidebar from "@/components/sidebar/main-sidebar";
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
    <div className="min-h-screen w-screen flex bg-background text-foreground">
      {/* The left sidebar */}
      <aside className="hidden lg:flex w-64 bg-white border-r flex-col shadow-lg z-50">
        <MainSidebar />
      </aside>

      {/* Main content area */}
      <main className="flex-1 flex flex-col">
        {/* Top bar */}
        <header className="h-16 flex items-center px-4 bg-brand-500 text-white shadow-md">
          <div className="flex-1 font-bold text-lg">My Award-Winning App</div>
          <UserNav />
        </header>

        {/* The actual page content */}
        <div className="flex-1 overflow-auto p-6">{children}</div>
      </main>
    </div>
  );
}
