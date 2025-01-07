// src/contexts/calendar-context.tsx
"use client";

import { createContext, useContext, ReactNode } from 'react';
import { useCalendarStore } from '@/store/calendar-store';
import { useTeacherStore } from '@/store/teacher-store';

type CalendarContextType = {
  isLoading: boolean;
  error: Error | null;
};

const CalendarContext = createContext<CalendarContextType | undefined>(undefined);

export function CalendarProvider({ children }: { children: ReactNode }) {
  const { events } = useCalendarStore();
  const { teachers } = useTeacherStore();

  // You can add more complex loading and error states here
  const isLoading = false;
  const error = null;

  return (
    <CalendarContext.Provider value={{ isLoading, error }}>
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