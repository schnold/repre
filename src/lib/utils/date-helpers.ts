import { DayCell, CalendarEvent, DateRange } from '../types/calendar';
import { 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  format,
  addMonths,
  subMonths,
  addWeeks,
  subWeeks
} from 'date-fns';

export const getMonthDays = (date: Date): DayCell[] => {
  const start = startOfWeek(startOfMonth(date));
  const end = endOfWeek(endOfMonth(date));

  return eachDayOfInterval({ start, end }).map(day => ({
    date: day,
    isCurrentMonth: isSameMonth(day, date),
    isToday: isSameDay(day, new Date()),
    events: []
  }));
};

export const getWeekDays = (date: Date): DayCell[] => {
  const start = startOfWeek(date);
  const end = endOfWeek(date);

  return eachDayOfInterval({ start, end }).map(day => ({
    date: day,
    isCurrentMonth: isSameMonth(day, date),
    isToday: isSameDay(day, new Date()),
    events: []
  }));
};

export const getDateRange = (date: Date, view: 'month' | 'week'): DateRange => {
  if (view === 'month') {
    return {
      start: startOfMonth(date),
      end: endOfMonth(date)
    };
  }
  return {
    start: startOfWeek(date),
    end: endOfWeek(date)
  };
};

export const navigateDate = (
  date: Date,
  view: 'month' | 'week',
  direction: 'next' | 'previous'
): Date => {
  if (view === 'month') {
    return direction === 'next' ? addMonths(date, 1) : subMonths(date, 1);
  }
  return direction === 'next' ? addWeeks(date, 1) : subWeeks(date, 1);
};

export const formatTimeRange = (start: Date, end: Date): string => {
  return `${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`;
};

export const formatDayHeader = (date: Date): string => {
  return format(date, 'EEE');
};

export const formatFullDate = (date: Date): string => {
  return format(date, 'MMMM d, yyyy');
};