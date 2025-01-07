// FILE: src/app/(app)/dashboard/analytics/page.tsx
"use client";

import TrendsView from "@/components/dashboard/analytics/trends-view";
import { BarChart2 } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BarChart2 className="h-6 w-6 text-brand-500" />
        <h1 className="text-2xl font-bold">Analytics</h1>
      </div>
      <p className="text-sm text-muted-foreground">
        Gain insights into your scheduling data.
      </p>
      <TrendsView />
    </div>
  );
}
