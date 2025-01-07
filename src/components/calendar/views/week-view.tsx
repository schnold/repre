import React from 'react';
import { useCalendarStore } from '@/store/calendar-store';
import { getWeekDays, formatTimeRange } from '@/lib/utils/date-helpers';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CalendarEvent, DayCell } from '@/lib/types/calendar';

interface EventStyle {
  top: string;
  height: string;
  left: string;
  right: string;
}

const WeekView: React.FC = () => {
  const { selectedDate, events } = useCalendarStore();
  const weekDays = getWeekDays(selectedDate);
  const hours = Array.from({ length: 24 }, (_, i) => i);

  const getEventStyle = (event: CalendarEvent): EventStyle => {
    const startHour = event.startTime.getHours() + event.startTime.getMinutes() / 60;
    const endHour = event.endTime.getHours() + event.endTime.getMinutes() / 60;
    const duration = endHour - startHour;
    
    return {
      top: `${startHour * 4}rem`,
      height: `${duration * 4}rem`,
      left: '0.5rem',
      right: '0.5rem',
    };
  };

  const getEventsForDay = (date: Date): CalendarEvent[] => {
    return events.filter((event: CalendarEvent) => 
      event.startTime.toDateString() === date.toDateString()
    );
  };

  const formatHour = (hour: number): string => {
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return '12 PM';
    return `${hour - 12} PM`;
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="grid grid-cols-[auto_1fr] gap-4">
        {/* Time Labels */}
        <div className="space-y-6 pr-4 pt-16">
          {hours.map((hour: number) => (
            <div key={hour} className="text-sm text-muted-foreground">
              {formatHour(hour)}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-px bg-muted">
          {weekDays.map((day: DayCell) => {
            const dayEvents = getEventsForDay(day.date);

            return (
              <div
                key={day.date.toISOString()}
                className={cn(
                  "relative bg-background",
                  day.isToday && "ring-2 ring-primary ring-inset"
                )}
              >
                {/* Day Header */}
                <div className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm p-2 text-center border-b">
                  <div className="font-medium text-sm">
                    {day.date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {day.date.getDate()}
                  </div>
                </div>

                {/* Events */}
                <div className="relative h-[96rem]"> {/* 24 hours * 4rem */}
                  <AnimatePresence>
                    {dayEvents.map((event: CalendarEvent) => (
                      <motion.div
                        key={event.id}
                        layoutId={event.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        style={getEventStyle(event)}
                        className={cn(
                          "absolute w-auto rounded-md p-2",
                          "bg-primary/10 text-primary",
                          "hover:bg-primary/20 transition-colors cursor-pointer"
                        )}
                      >
                        <div className="text-xs font-medium truncate">
                          {event.title}
                        </div>
                        <div className="text-xs opacity-75">
                          {formatTimeRange(event.startTime, event.endTime)}
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Hour Grid Lines */}
                  {hours.map((hour: number) => (
                    <div
                      key={hour}
                      className="absolute w-full border-t border-muted"
                      style={{ top: `${hour * 4}rem` }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default WeekView;