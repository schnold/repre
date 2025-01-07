import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarView } from '@/lib/types/calendar';
import { useCalendarStore } from '@/store/calendar-store';

const ViewSwitcher = () => {
  const { currentView, setCurrentView } = useCalendarStore();

  const views: { value: CalendarView; label: string }[] = [
    { value: 'month', label: 'Month' },
    { value: 'week', label: 'Week' },
    { value: 'agenda', label: 'Agenda' }
  ];

  return (
    <Select value={currentView} onValueChange={(value) => setCurrentView(value as CalendarView)}>
      <SelectTrigger className="w-32">
        <SelectValue placeholder="Select view" />
      </SelectTrigger>
      <SelectContent>
        {views.map((view) => (
          <SelectItem key={view.value} value={view.value}>
            {view.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

export default ViewSwitcher;