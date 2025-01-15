// src/contexts/calendar-context.tsx
"use client";

import React, { createContext, useContext, useCallback } from 'react';
import { useCalendarStore } from '@/store/calendar-store';
import { IEvent } from '@/lib/db/schema/event';
import { CalendarView } from '@/store/calendar-store';
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';

interface CalendarContextType {
  selectedDate: Date;
  view: CalendarView;
  events: IEvent[];
  isEventModalOpen: boolean;
  modalMode: 'create' | 'edit';
  selectedEvent: IEvent | null;
  searchQuery: string;
  setSelectedDate: (date: Date) => void;
  setView: (view: CalendarView) => void;
  setEvents: (events: IEvent[]) => void;
  setEventModalOpen: (open: boolean) => void;
  setModalMode: (mode: 'create' | 'edit') => void;
  setSelectedEvent: (event: IEvent | null) => void;
  addEvent: (event: IEvent) => void;
  updateEvent: (event: IEvent) => void;
  deleteEvent: (id: string) => void;
  setSearchQuery: (query: string) => void;
  getFilteredEvents: () => IEvent[];
  getEventsForDate: (date: Date) => IEvent[];
  getEventsForWeek: (date: Date) => IEvent[];
  getEventsForMonth: (date: Date) => IEvent[];
}

const CalendarContext = createContext<CalendarContextType | null>(null);

export function CalendarProvider({ children }: { children: React.ReactNode }) {
  const store = useCalendarStore();

  const getEventsForDate = useCallback((date: Date) => {
    const dayStart = startOfDay(date);
    const dayEnd = endOfDay(date);
    return store.events.filter(event => {
      const eventStart = new Date(event.startTime);
      const eventEnd = new Date(event.endTime);
      return eventStart >= dayStart && eventStart <= dayEnd;
    });
  }, [store.events]);

  const getEventsForWeek = useCallback((date: Date) => {
    const weekStart = startOfWeek(date);
    const weekEnd = endOfWeek(date);
    return store.events.filter(event => {
      const eventStart = new Date(event.startTime);
      const eventEnd = new Date(event.endTime);
      return eventStart >= weekStart && eventStart <= weekEnd;
    });
  }, [store.events]);

  const getEventsForMonth = useCallback((date: Date) => {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    return store.events.filter(event => {
      const eventStart = new Date(event.startTime);
      const eventEnd = new Date(event.endTime);
      return eventStart >= monthStart && eventStart <= monthEnd;
    });
  }, [store.events]);

  const contextValue = {
    selectedDate: store.selectedDate,
    view: store.view,
    events: store.events,
    isEventModalOpen: store.isEventModalOpen,
    modalMode: store.modalMode,
    selectedEvent: store.selectedEvent,
    searchQuery: store.searchQuery,
    setSelectedDate: store.setSelectedDate,
    setView: store.setView,
    setEvents: store.setEvents,
    setEventModalOpen: store.setEventModalOpen,
    setModalMode: store.setModalMode,
    setSelectedEvent: store.setSelectedEvent,
    addEvent: store.addEvent,
    updateEvent: store.updateEvent,
    deleteEvent: store.deleteEvent,
    setSearchQuery: store.setSearchQuery,
    getFilteredEvents: store.getFilteredEvents,
    getEventsForDate,
    getEventsForWeek,
    getEventsForMonth,
  };

  return (
    <CalendarContext.Provider value={contextValue}>
      {children}
    </CalendarContext.Provider>
  );
}

export function useCalendarContext() {
  const context = useContext(CalendarContext);
  if (!context) {
    throw new Error('useCalendarContext must be used within a CalendarProvider');
  }
  return context;
}