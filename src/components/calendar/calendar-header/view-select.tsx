"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarView } from "@/lib/types/calendar";

interface ViewSelectProps {
  view: CalendarView;
  onViewChange: (view: CalendarView) => void;
}

export function ViewSelect({ view, onViewChange }: ViewSelectProps) {
  return (
    <Select value={view} onValueChange={onViewChange}>
      <SelectTrigger className="w-[120px]">
        <SelectValue placeholder="Select view" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="day">Day</SelectItem>
        <SelectItem value="week">Week</SelectItem>
        <SelectItem value="month">Month</SelectItem>
        <SelectItem value="agenda">Agenda</SelectItem>
      </SelectContent>
    </Select>
  );
} 