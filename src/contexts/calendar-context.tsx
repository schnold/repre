// src/contexts/calendar-context.tsx
"use client";

import { createContext, useContext, ReactNode, useCallback, useMemo } from 'react';
import { useCalendarStore } from '@/store/calendar-store';
import { useTeacherStore } from '@/store/teacher-store';
import type { CalendarEvent } from '@/lib/types/calendar';
import type { Teacher } from '@/lib/types/teacher';
import { addMonths, subMonths, addWeeks, subWeeks, addDays, subDays } from 'date-fns';

type NavigationDirection = 'next' | 'previous';

type CalendarContextType = {
  isLoading: boolean;
  error: Error | null;
  events: CalendarEvent[];
  teachers: Teacher[];
  navigateDate: (direction: NavigationDirection) => void;
  navigateToToday: () => void;
  getEventsForDate: (date: Date) => CalendarEvent[];
  getEventsForWeek: (date: Date) => CalendarEvent[];
  getEventsForMonth: (date: Date) => CalendarEvent[];
  getTeacherById: (id: string) => Teacher | undefined;
  selectedDate: Date;
};

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export function CalendarProvider({ children }: { children: ReactNode }) {
  const { 
    events, 
    selectedDate, 
    setSelectedDate, 
    currentView 
  } = useCalendarStore();
  const { teachers } = useTeacherStore();

  const isLoading = false;
  const error = null;

  const navigateDate = useCallback((direction: NavigationDirection) => {
    const currentDate = selectedDate;
    let newDate: Date;

    switch (currentView) {
      case 'month':
        newDate = direction === 'next' 
          ? addMonths(currentDate, 1) 
          : subMonths(currentDate, 1);
        break;
      case 'week':
        newDate = direction === 'next' 
          ? addWeeks(currentDate, 1) 
          : subWeeks(currentDate, 1);
        break;
      case 'day':
        newDate = direction === 'next' 
          ? addDays(currentDate, 1) 
          : subDays(currentDate, 1);
        break;
      default:
        newDate = currentDate;
    }

    setSelectedDate(newDate);
  }, [currentView, selectedDate, setSelectedDate]);

  const navigateToToday = useCallback(() => {
    setSelectedDate(new Date());
  }, [setSelectedDate]);

  const getEventsForDate = useCallback((date: Date) => {
    return events.filter(event => 
      event.startTime.toDateString() === date.toDateString()
    );
  }, [events]);

  const getEventsForWeek = useCallback((date: Date) => {
    const weekStart = new Date(date);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    return events.filter(event =>
      event.startTime >= weekStart && event.startTime <= weekEnd
    );
  }, [events]);

  const getEventsForMonth = useCallback((date: Date) => {
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0);

    return events.filter(event =>
      event.startTime >= monthStart && event.startTime <= monthEnd
    );
  }, [events]);

  const getTeacherById = useCallback((id: string) => {
    return teachers.find(teacher => teacher.id === id);
  }, [teachers]);

  const value = useMemo(() => ({
    isLoading,
    error,
    events,
    teachers,
    navigateDate,
    navigateToToday,
    getEventsForDate,
    getEventsForWeek,
    getEventsForMonth,
    getTeacherById,
    selectedDate
  }), [
    events,
    teachers,
    navigateDate,
    navigateToToday,
    getEventsForDate,
    getEventsForWeek,
    getEventsForMonth,
    getTeacherById,
    selectedDate
  ]);

  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendarContext() {
  const context = useContext(CalendarContext);
  if (context === undefined) {
    throw new Error('useCalendarContext must be used within a CalendarProvider');
  }
  return context;
}