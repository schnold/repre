'use client'

import React from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { formatFullDate } from '@/lib/utils/date-helpers';
import { useCalendarStore } from '@/store/calendar-store';
import { navigateDate } from '@/lib/utils/date-helpers';

const DateNavigator = () => {
  const { selectedDate, currentView, setSelectedDate } = useCalendarStore();

  const handleNavigate = (direction: 'next' | 'previous') => {
    const newDate = navigateDate(selectedDate, currentView, direction);
    setSelectedDate(newDate);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
  };

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleNavigate('previous')}
          className="hover:bg-muted"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">
            {formatFullDate(selectedDate)}
          </h2>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleNavigate('next')}
          className="hover:bg-muted"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <Button 
        variant="outline" 
        onClick={goToToday}
        className="hidden sm:inline-flex"
      >
        Today
      </Button>
    </div>
  );
};

export default DateNavigator;