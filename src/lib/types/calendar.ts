// src/lib/types/calendar.ts
export type CalendarView = 'month' | 'week' | 'day' | 'agenda';

export type EventCategory = 'work' | 'personal' | 'important' | 'other';
export type RecurringPattern = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime: Date;
  location?: string;
  category: EventCategory;
  isRecurring?: boolean;
  recurringPattern?: RecurringPattern;
  recurringEndDate?: Date;
  color?: string;
  teacherId?: string;
  substituteTeacherId?: string;
  subjectId?: string;
  metadata?: Record<string, unknown>;
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
  filters: {
    categories: EventCategory[];
    search: string;
    teachers: string[];
    subjects: string[];
  };
}

export interface DayCell {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
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