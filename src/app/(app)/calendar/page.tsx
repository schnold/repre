// src/app/(app)/calendar/page.tsx
"use client";

import { CalendarView } from "@/components/calendar/calendar-view";
import { CalendarProvider } from "@/contexts/calendar-context";

export default function CalendarPage() {
  return (
    <CalendarProvider>
      <CalendarView />
    </CalendarProvider>
  );
}