// src/components/calendar/calendar-header/date-navigator.tsx
'use client';

import React, { useMemo } from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { formatFullDate } from '@/lib/utils/date-helpers';
import { useCalendarContext } from '@/contexts/calendar-context';
import { useCalendarStore } from '@/store/calendar-store';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const DateNavigator = () => {
  const { navigateDate, navigateToToday, selectedDate } = useCalendarContext();
  const { currentView, setSelectedDate } = useCalendarStore();

  const dateDisplay = useMemo(() => {
    switch (currentView) {
      case 'month':
        return format(selectedDate, 'MMMM yyyy');
      case 'week':
        const weekStart = new Date(selectedDate);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
      case 'day':
      case 'agenda':
        return format(selectedDate, 'EEEE, MMMM d, yyyy');
      default:
        return formatFullDate(selectedDate);
    }
  }, [selectedDate, currentView]);

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigateDate('previous')}
          className="hover:bg-muted"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Popover>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              className={cn(
                "flex items-center gap-2 font-normal w-auto",
                "hover:bg-muted px-3"
              )}
            >
              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                {dateDisplay}
              </span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              initialFocus
            />
          </PopoverContent>
        </Popover>

        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigateDate('next')}
          className="hover:bg-muted"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <Button 
        variant="outline" 
        size="sm"
        onClick={navigateToToday}
        className="hidden sm:inline-flex"
      >
        Today
      </Button>
    </div>
  );
};

export default DateNavigator;