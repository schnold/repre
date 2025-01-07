// FILE: src/components/dashboard/widgets/calendar-widget.tsx
"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useCalendarStore } from "@/store/calendar-store";
import { format } from "date-fns";

export default function CalendarWidget() {
  const { events } = useCalendarStore();

  // Instead of `toDateString()`, parse each event’s startTime as Date
  const todayStr = new Date().toDateString();

  const todayEvents = events.filter((evt) => {
    // If startTime is stored as string in evt, parse it:
    const start = new Date(evt.startTime);
    return start.toDateString() === todayStr;
  });

  return (
    <Card className="bg-card h-full">
      <CardHeader>
        <CardTitle>Today’s Events</CardTitle>
      </CardHeader>
      <CardContent>
        {todayEvents.length === 0 ? (
          <p className="text-sm text-muted-foreground">No events today.</p>
        ) : (
          <ul className="space-y-2">
            {todayEvents.map((evt) => {
              const start = new Date(evt.startTime);
              const end = new Date(evt.endTime);
              return (
                <li key={evt.id} className="text-sm">
                  <strong>{evt.title}</strong> — {format(start, "p")} to{" "}
                  {format(end, "p")}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
