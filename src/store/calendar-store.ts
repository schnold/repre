"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {  CalendarEvent, CalendarView, EventCategory } from '@/lib/types/calendar';
import { getDateRange } from '@/lib/utils/date-helpers';

interface FilterState {
  categories: EventCategory[];
  searchQuery: string;
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
}

interface CalendarStore {
  // Core State
  events: CalendarEvent[];
  selectedDate: Date;
  currentView: CalendarView;
  dateRange: { start: Date; end: Date };
  
  // Filters
  filters: FilterState;
  
  // UI State
  selectedEventId: string | null;
  isEventModalOpen: boolean;
  modalMode: 'create' | 'edit' | 'view';

  // Event Actions
  addEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  updateEvent: (id: string, event: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  duplicateEvent: (id: string) => void;
  clearEvents: () => void;
  moveEvent: (id: string, newStartTime: Date, newEndTime: Date) => void;

  // Navigation Actions
  setSelectedDate: (date: Date) => void;
  setCurrentView: (view: CalendarView) => void;
  updateDateRange: () => void;

  // Filter Actions
  setFilters: (filters: Partial<FilterState>) => void;
  clearFilters: () => void;
  getFilteredEvents: () => CalendarEvent[];

  // UI Actions
  setSelectedEventId: (id: string | null) => void;
  setEventModalOpen: (isOpen: boolean) => void;
  setModalMode: (mode: 'create' | 'edit' | 'view') => void;
}

const defaultFilters: FilterState = {
  categories: ['work', 'personal', 'important', 'other'],
  searchQuery: '',
  dateRange: { start: null, end: null }
};

export const useCalendarStore = create<CalendarStore>()(
  persist(
    (set, get) => ({
      // Initial State
      events: [],
      selectedDate: new Date(),
      currentView: 'month',
      dateRange: getDateRange(new Date(), 'month'),
      filters: defaultFilters,
      selectedEventId: null,
      isEventModalOpen: false,
      modalMode: 'view',

      // Event Management
      addEvent: (eventData) => {
        const event: CalendarEvent = {
          id: crypto.randomUUID(),
          ...eventData,
        };
        set((state) => ({
          events: [...state.events, event],
        }));
      },

      updateEvent: (id, updatedEvent) =>
        set((state) => ({
          events: state.events.map((event) =>
            event.id === id ? { ...event, ...updatedEvent } : event
          ),
        })),

      deleteEvent: (id) =>
        set((state) => ({
          events: state.events.filter((event) => event.id !== id),
          selectedEventId: state.selectedEventId === id ? null : state.selectedEventId,
        })),

      clearEvents: () => set({ events: [] }),

      duplicateEvent: (id) => {
        const event = get().events.find((e) => e.id === id);
        if (event) {
          const duplicatedEvent: CalendarEvent = {
            ...event,
            id: crypto.randomUUID(),
            title: `${event.title} (Copy)`,
          };
          set((state) => ({
            events: [...state.events, duplicatedEvent],
          }));
        }
      },

      moveEvent: (id, newStartTime, newEndTime) =>
        set((state) => ({
          events: state.events.map((event) =>
            event.id === id
              ? { ...event, startTime: newStartTime, endTime: newEndTime }
              : event
          ),
        })),

      // Navigation
      setSelectedDate: (date) =>
        set((state) => ({
          selectedDate: date,
          dateRange: getDateRange(date, state.currentView),
        })),

      setCurrentView: (view) =>
        set((state) => ({
          currentView: view,
          dateRange: getDateRange(state.selectedDate, view),
        })),

      updateDateRange: () =>
        set((state) => ({
          dateRange: getDateRange(state.selectedDate, state.currentView),
        })),

      // Filtering
      setFilters: (newFilters) =>
        set((state) => ({
          filters: { ...state.filters, ...newFilters },
        })),

      clearFilters: () => set({ filters: defaultFilters }),

      getFilteredEvents: () => {
        const state = get();
        return state.events.filter((event) => {
          const matchesCategory = state.filters.categories.includes(event.category);
          const matchesSearch = state.filters.searchQuery
            ? event.title.toLowerCase().includes(state.filters.searchQuery.toLowerCase()) ||
              (event.description?.toLowerCase() || '').includes(
                state.filters.searchQuery.toLowerCase()
              )
            : true;
          const matchesDateRange =
            state.filters.dateRange.start && state.filters.dateRange.end
              ? event.startTime >= state.filters.dateRange.start &&
                event.endTime <= state.filters.dateRange.end
              : true;

          return matchesCategory && matchesSearch && matchesDateRange;
        });
      },

      // UI Management
      setSelectedEventId: (id) => set({ selectedEventId: id }),
      setEventModalOpen: (isOpen) => set({ isEventModalOpen: isOpen }),
      setModalMode: (mode) => set({ modalMode: mode }),
    }),
    {
      name: 'calendar-store',
      partialize: (state) => ({
        events: state.events,
        selectedDate: state.selectedDate,
        currentView: state.currentView,
        filters: state.filters,
      }),
    }
  )
);