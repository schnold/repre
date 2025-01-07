// FILE: src/components/dashboard/overview/recent-activities.tsx
"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function RecentActivities() {
  // Example data
  const activities = [
    { id: 1, text: "Teacher John updated a lesson plan", time: "2 hours ago" },
    { id: 2, text: "Mary signed up as a new substitute", time: "4 hours ago" },
    { id: 3, text: "Event 'Math Class' was rescheduled", time: "Yesterday" },
  ];

  return (
    <Card className="bg-card h-full">
      <CardHeader>
        <CardTitle>Recent Activities</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm">
          {activities.map((activity) => (
            <li key={activity.id} className="flex items-center justify-between">
              <span>{activity.text}</span>
              <span className="text-xs text-muted-foreground">{activity.time}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
