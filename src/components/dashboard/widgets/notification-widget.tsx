// FILE: src/components/dashboard/widgets/notification-widget.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NotificationWidget() {
  // Hardcode or fetch from /api/notifications
  const notifications = [
    {
      id: 1,
      message: "Your subscription is about to expire",
      type: "warning",
    },
    {
      id: 2,
      message: "New substitute applied for your open shift",
      type: "info",
    },
  ];

  return (
    <Card className="bg-card h-full">
      <CardHeader>
        <CardTitle>Notifications</CardTitle>
      </CardHeader>
      <CardContent>
        {notifications.length === 0 ? (
          <p className="text-sm text-muted-foreground">No new notifications.</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {notifications.map((notif) => (
              <li key={notif.id}>
                <span>{notif.message}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
