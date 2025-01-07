export type CalendarView = 'month' | 'week' | 'agenda';

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
    color?: string;
    teacherId?: string;
    substituteTeacherId?: string  
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
}

export interface DayCell {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}