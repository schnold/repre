// FILE: src/app/(app)/dashboard/page.tsx
"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Import your new widgets
import QuickStats from "@/components/dashboard/overview/quick-stats";
import RecentActivities from "@/components/dashboard/overview/recent-activities";
import CalendarWidget from "@/components/dashboard/widgets/calendar-widget";
import NotificationWidget from "@/components/dashboard/widgets/notification-widget";

export default function DashboardPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  // If you only want the actual page to be protected (and not the entire layout)
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return <p>Loading dashboard...</p>;
  }

  return (
    <div className="p-4 space-y-6">
      <header>
        <h1 className="text-3xl font-bold">Welcome, {user.name || user.email}!</h1>
        <p className="text-muted-foreground">
          Here is your personalized dashboard.
        </p>
      </header>

      {/* A grid of small widgets, for example */}
      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <QuickStats />
        <RecentActivities />
        <CalendarWidget />
        <NotificationWidget />
      </section>

      {/* Possibly more content or links */}
      <section className="mt-8">
        <h2 className="text-xl font-semibold mb-4">More Data</h2>
        <p>Explore analytics, settings, etc.</p>
        <a href="/dashboard/analytics" className="underline text-primary">
          Go to Analytics
        </a>
      </section>
    </div>
  );
}
