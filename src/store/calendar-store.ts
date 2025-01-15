"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { IEvent } from '@/lib/db/schema/event';

export type CalendarView = 'day' | 'week' | 'month' | 'agenda';

interface CalendarState {
  selectedDate: Date;
  view: CalendarView;
  currentView: string;
  events: IEvent[];
  isEventModalOpen: boolean;
  modalMode: 'create' | 'edit';
  selectedEvent: IEvent | null;
  selectedEventId: string | null;
  searchQuery: string;
  subjects: { id: string; name: string; color: string }[];
  setSelectedDate: (date: Date) => void;
  setView: (view: CalendarView) => void;
  setEvents: (events: IEvent[]) => void;
  clearEvents: () => void;
  setEventModalOpen: (open: boolean) => void;
  setModalMode: (mode: 'create' | 'edit') => void;
  setSelectedEvent: (event: IEvent | null) => void;
  setSelectedEventId: (id: string | null) => void;
  addEvent: (event: IEvent) => void;
  updateEvent: (event: IEvent) => void;
  deleteEvent: (id: string) => void;
  duplicateEvent: (id: string) => void;
  setSearchQuery: (query: string) => void;
  getFilteredEvents: () => IEvent[];
  setSubjects: (subjects: { id: string; name: string; color: string }[]) => void;
  addSubject: (subject: { id: string; name: string; color: string }) => void;
  updateSubject: (id: string, subject: { name: string; color: string }) => void;
  deleteSubject: (id: string) => void;
}

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set, get) => ({
      selectedDate: new Date(),
      view: 'month',
      currentView: 'month',
      events: [],
      isEventModalOpen: false,
      modalMode: 'create',
      selectedEvent: null,
      selectedEventId: null,
      searchQuery: '',
      subjects: [],
      setSelectedDate: (date) => set({ selectedDate: date }),
      setView: (view) => set({ view }),
      setEvents: (events) => set({ events }),
      clearEvents: () => set({ events: [] }),
      setEventModalOpen: (open) => set({ isEventModalOpen: open }),
      setModalMode: (mode) => set({ modalMode: mode }),
      setSelectedEvent: (event) => set({ selectedEvent: event }),
      setSelectedEventId: (id) => set({ selectedEventId: id }),
      addEvent: (event) => set((state) => ({ 
        events: [...state.events, event] 
      })),
      updateEvent: (event) => set((state) => ({
        events: state.events.map(e => e._id === event._id ? event : e)
      })),
      deleteEvent: (id) => set((state) => ({ 
        events: state.events.filter(e => e._id !== id) 
      })),
      duplicateEvent: (id) => set((state) => {
        const eventToDuplicate = state.events.find(e => e._id === id);
        if (!eventToDuplicate) return state;
        
        const duplicatedEvent = {
          ...eventToDuplicate,
          _id: crypto.randomUUID(),
          title: `${eventToDuplicate.title} (Copy)`,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        return { events: [...state.events, duplicatedEvent] };
      }),
      setSearchQuery: (query) => set({ searchQuery: query }),
      getFilteredEvents: () => {
        const state = get();
        const query = state.searchQuery.toLowerCase();
        if (!query) return state.events;
        
        return state.events.filter(event => 
          event.title?.toLowerCase().includes(query) ||
          event.description?.toLowerCase().includes(query) ||
          event.room?.toLowerCase().includes(query)
        );
      },
      setSubjects: (subjects) => set({ subjects }),
      addSubject: (subject) => set((state) => ({ 
        subjects: [...state.subjects, subject] 
      })),
      updateSubject: (id, subject) => set((state) => ({
        subjects: state.subjects.map(s => s.id === id ? { ...s, ...subject } : s)
      })),
      deleteSubject: (id) => set((state) => ({ 
        subjects: state.subjects.filter(s => s.id !== id) 
      })),
    }),
    {
      name: 'calendar-storage',
      partialize: (state) => ({
        ...state,
        selectedDate: state.selectedDate.toISOString(),
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.selectedDate = new Date(state.selectedDate);
        }
      },
    }
  )
);