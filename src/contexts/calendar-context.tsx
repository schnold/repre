// src/contexts/calendar-context.tsx
"use client";

import { createContext, useContext, ReactNode } from 'react';
import { useCalendarStore } from '@/store/calendar-store';
import { useTeacherStore } from '@/store/teacher-store';
import type { CalendarEvent } from '@/lib/types/calendar';
import type { Teacher } from '@/lib/types/teacher';

type CalendarContextType = {
  isLoading: boolean;
  error: Error | null;
  events: CalendarEvent[];
  teachers: Teacher[];
};

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export function CalendarProvider({ children }: { children: ReactNode }) {
  const { events } = useCalendarStore();
  const { teachers } = useTeacherStore();

  // You can add more complex loading and error states here
  const isLoading = false;
  const error = null;

  const value = {
    isLoading,
    error,
    events,
    teachers
  };

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