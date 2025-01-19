"use client";

import { CalendarView } from "@/components/calendar/calendar-view";
import { CalendarProvider } from "@/contexts/calendar-context";

export default function OrganizationCalendarPage({
  params,
}: {
  params: { id: string };
}) {
  return (
    <CalendarProvider>
      <CalendarView />
    </CalendarProvider>
  );
} 