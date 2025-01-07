// FILE: src/components/dashboard/overview/quick-stats.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function QuickStats() {
  // Hardcode or fetch from an API, e.g. /api/dashboard
  const stats = [
    { label: "Total Teachers", value: 42 },
    { label: "Upcoming Events", value: 8 },
    { label: "Pending Subs", value: 3 },
    { label: "Active Classes", value: 12 },
  ];

  return (
    <Card className="bg-card h-full">
      <CardHeader>
        <CardTitle>Quick Stats</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {stats.map((stat) => (
          <div key={stat.label} className="flex justify-between text-sm">
            <span className="font-medium">{stat.label}</span>
            <span>{stat.value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
