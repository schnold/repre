// src/components/calendar/calendar-header/date-navigator.tsx
'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { format, addDays, subDays } from 'date-fns';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from '@/lib/utils';

interface DateNavigatorProps {
  date: Date;
  onDateChange: (date: Date) => void;
  view: 'day' | 'week' | 'month' | 'agenda';
}

const DateNavigator = ({ date, onDateChange, view }: DateNavigatorProps) => {
  const dateDisplay = React.useMemo(() => {
    switch (view) {
      case 'month':
        return format(date, 'MMMM yyyy');
      case 'week':
        const weekStart = new Date(date);
        weekStart.setDate(weekStart.getDate() - weekStart.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekEnd.getDate() + 6);
        return `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`;
      case 'day':
      case 'agenda':
        return format(date, 'EEEE, MMMM d, yyyy');
      default:
        return format(date, 'PPP');
    }
  }, [date, view]);

  const navigateDate = (direction: 'previous' | 'next') => {
    const days = view === 'month' ? 30 : view === 'week' ? 7 : 1;
    onDateChange(direction === 'next' ? addDays(date, days) : subDays(date, days));
  };

  const navigateToToday = () => {
    onDateChange(new Date());
  };

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
          <PopoverContent className="w-auto p-0 bg-slate-800/70 backdrop-blur-md" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => newDate && onDateChange(newDate)}
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