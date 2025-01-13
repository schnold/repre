// src/components/calendar/calendar-header/view-switcher.tsx
'use client';

import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarView } from '@/lib/types/calendar';
import { useCalendarStore } from '@/store/calendar-store';
import { Button } from '@/components/ui/button';
import { Calendar, LayoutList, Calendar as CalendarRange, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TeacherModal } from "@/components/teachers/teacher-modal";

const ViewSwitcher = () => {
  const { currentView, setCurrentView } = useCalendarStore();

  const views: { value: CalendarView; label: string; icon: React.ElementType }[] = [
    { value: 'month', label: 'Month', icon: Calendar },
    { value: 'week', label: 'Week', icon: CalendarRange },
    { value: 'day', label: 'Day', icon: Clock },
    { value: 'agenda', label: 'Agenda', icon: LayoutList }
  ];

  // Mobile view: use a select dropdown
  const MobileSelect = () => (
    <Select value={currentView} onValueChange={(value) => setCurrentView(value as CalendarView)}>
      <SelectTrigger className="w-32 md:hidden">
        <SelectValue placeholder="Select view" />
      </SelectTrigger>
      <SelectContent>
        {views.map((view) => (
          <SelectItem key={view.value} value={view.value}>
            <div className="flex items-center gap-2">
              <view.icon className="h-4 w-4" />
              {view.label}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  // Desktop view: use buttons
  const DesktopButtons = () => (
    <div className="hidden md:flex items-center gap-1 bg-muted p-1 rounded-md">
      {views.map((view) => {
        const Icon = view.icon;
        return (
          <Button
            key={view.value}
            variant="ghost"
            size="sm"
            onClick={() => setCurrentView(view.value as CalendarView)}
            className={cn(
              "gap-2",
              currentView === view.value && "bg-background shadow-sm"
            )}
          >
            <Icon className="h-4 w-4" />
            <span>{view.label}</span>
          </Button>
        );
      })}
    </div>
  );

  return (
    <>
      <MobileSelect />
      <DesktopButtons />
    </>
  );
};

export default ViewSwitcher;