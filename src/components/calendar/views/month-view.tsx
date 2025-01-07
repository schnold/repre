import React from 'react';
import { useCalendarStore } from '@/store/calendar-store';
import { getMonthDays, formatDayHeader } from '@/lib/utils/date-helpers';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CalendarEvent, DayCell } from '@/lib/types/calendar';

const MonthView: React.FC = () => {
  const { selectedDate, events } = useCalendarStore();
  const days = getMonthDays(selectedDate);

  const getEventsForDay = (date: Date): CalendarEvent[] => {
    return events.filter((event: CalendarEvent) => 
      event.startTime.toDateString() === date.toDateString()
    );
  };

  return (
    <div className="h-full p-4">
      <div className="grid grid-cols-7 gap-px bg-muted rounded-lg overflow-hidden border">
        {/* Day Headers */}
        {days.slice(0, 7).map((day: DayCell, i: number) => (
          <div
            key={`header-${i}`}
            className="bg-background p-2 text-center text-sm font-medium text-muted-foreground"
          >
            {formatDayHeader(day.date)}
          </div>
        ))}

        {/* Calendar Days */}
        {days.map((day: DayCell, index: number) => {
          const dayEvents = getEventsForDay(day.date);

          return (
            <motion.div
              key={day.date.toISOString()}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02 }}
              className={cn(
                "min-h-[120px] p-2 bg-background relative group hover:bg-muted/50 transition-colors",
                !day.isCurrentMonth && "bg-muted/5",
                day.isToday && "ring-2 ring-primary ring-inset"
              )}
            >
              <div className="sticky top-0 z-10 flex items-center justify-between">
                <span
                  className={cn(
                    "text-sm",
                    !day.isCurrentMonth && "text-muted-foreground",
                    day.isToday && "text-primary font-medium"
                  )}
                >
                  {day.date.getDate()}
                </span>
                
                {dayEvents.length > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center text-xs text-primary bg-primary/10 rounded-full">
                    {dayEvents.length}
                  </span>
                )}
              </div>

              <div className="mt-2 space-y-1">
                {dayEvents.slice(0, 3).map((event: CalendarEvent) => (
                  <motion.div
                    key={event.id}
                    layoutId={event.id}
                    className={cn(
                      "px-2 py-1 text-xs rounded-md truncate",
                      "bg-primary/10 text-primary",
                      "hover:bg-primary/20 transition-colors cursor-pointer"
                    )}
                  >
                    {event.title}
                  </motion.div>
                ))}
                {dayEvents.length > 3 && (
                  <div className="text-xs text-muted-foreground px-2">
                    +{dayEvents.length - 3} more
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthView;