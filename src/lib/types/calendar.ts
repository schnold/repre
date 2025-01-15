// src/lib/types/calendar.ts
import { IEvent } from '@/lib/db/interfaces';

export type CalendarView = 'month' | 'week' | 'day' | 'agenda';

export type EventCategory = 'work' | 'personal' | 'important' | 'other';
export type RecurringPattern = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface DayCell {
  date: Date;
  isToday: boolean;
  isCurrentMonth: boolean;
}

export interface CalendarEvent {
  id: string;
  _id?: string;
  title: string;
  startTime: Date;
  endTime: Date;
  color?: string;
  location?: string;
  subjectId?: string;
  teacherId?: string;
  substituteTeacherId?: string;
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface CalendarState {
  events: CalendarEvent[];
  selectedDate: Date;
  currentView: CalendarView;
  dateRange: DateRange;
  subjects: { id: string; name: string; color: string }[];
  filters: {
    categories: EventCategory[];
    search: string;
    teachers: string[];
    subjects: string[];
  };
}

export interface EventDragInfo {
  event: CalendarEvent;
  newStartTime: Date;
  newEndTime: Date;
}

export interface ConflictInfo {
  hasConflict: boolean;
  conflictingEvents: CalendarEvent[];
  type: 'teacher' | 'location' | 'student' | null;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  reminderTime: number; // minutes before event
  notifyOnChange: boolean;
}

export interface FilterOptions {
  categories: EventCategory[];
  teachers: string[];
  subjects: string[];
  dateRange?: DateRange;
  searchQuery?: string;
}

export interface ViewSettings {
  showWeekends: boolean;
  workingHours: {
    start: string;
    end: string;
  };
  firstDayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  timeSlotDuration: number; // minutes
  snapToGrid: boolean;
}