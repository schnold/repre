import { create } from 'zustand';
import { CalendarState, CalendarEvent, CalendarView } from '@/lib/types/calendar';
import { getDateRange } from '@/lib/utils/date-helpers';

interface CalendarStore extends CalendarState {
  addEvent: (event: CalendarEvent) => void;
  updateEvent: (id: string, event: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  setSelectedDate: (date: Date) => void;
  setCurrentView: (view: CalendarView) => void;
  updateDateRange: () => void;
}

export const useCalendarStore = create<CalendarStore>((set, get) => ({
  events: [],
  selectedDate: new Date(),
  currentView: 'month',
  dateRange: getDateRange(new Date(), 'month'),

  addEvent: (event) => 
    set((state) => ({ events: [...state.events, event] })),

  updateEvent: (id, updatedEvent) =>
    set((state) => ({
      events: state.events.map((event) =>
        event.id === id ? { ...event, ...updatedEvent } : event
      ),
    })),

  deleteEvent: (id) =>
    set((state) => ({
      events: state.events.filter((event) => event.id !== id),
    })),

  setSelectedDate: (date) =>
    set((state) => {
      const dateRange = getDateRange(date, state.currentView);
      return { selectedDate: date, dateRange };
    }),

  setCurrentView: (view) =>
    set((state) => {
      const dateRange = getDateRange(state.selectedDate, view);
      return { currentView: view, dateRange };
    }),

  updateDateRange: () =>
    set((state) => ({
      dateRange: getDateRange(state.selectedDate, state.currentView),
    })),
}));