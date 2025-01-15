// src/components/calendar/views/week-view.tsx
import React, { useMemo } from 'react';
import { useCalendarStore } from '@/store/calendar-store';
import { getWeekDays, formatTimeRange } from '@/lib/utils/date-helpers';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CalendarEvent, DayCell } from '@/lib/types/calendar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';


interface EventLayoutInfo extends CalendarEvent {
  column: number;
  columnSpan: number;
  conflictCount: number;
}

const HOUR_HEIGHT = 60; // pixels per hour
const MINUTES_IN_DAY = 24 * 60;

const WeekView: React.FC = () => {
  const { selectedDate, events, setSelectedEventId, setEventModalOpen, setModalMode, subjects } = useCalendarStore();
  const weekDays = getWeekDays(selectedDate);

  // Get all events for the week
  const weekEvents = useMemo(() => {
    const startOfWeek = weekDays[0].date;
    const endOfWeek = weekDays[6].date;
    return events.filter((event) => {
      const eventDate = event.startTime;
      return eventDate >= startOfWeek && eventDate <= endOfWeek;
    });
  }, [events, weekDays]);

  // Calculate event positions and detect overlaps
  const layoutEventsForDay = (dayEvents: CalendarEvent[]): EventLayoutInfo[] => {
    if (!dayEvents.length) return [];

    // Sort events by start time
    const sortedEvents = [...dayEvents].sort(
      (a, b) => a.startTime.getTime() - b.startTime.getTime()
    );

    const columns: EventLayoutInfo[][] = [];
    const eventLayouts: EventLayoutInfo[] = [];

    sortedEvents.forEach((event) => {
      // Find the first column where the event doesn't overlap
      let columnIndex = 0;
      let foundColumn = false;

      while (!foundColumn) {
        if (!columns[columnIndex]) {
          columns[columnIndex] = [];
          foundColumn = true;
        } else {
          const hasOverlap = columns[columnIndex].some(
            (existingEvent) =>
              event.startTime < existingEvent.endTime &&
              event.endTime > existingEvent.startTime
          );

          if (!hasOverlap) {
            foundColumn = true;
          } else {
            columnIndex++;
          }
        }
      }

      const eventLayout: EventLayoutInfo = {
        ...event,
        column: columnIndex,
        columnSpan: 1,
        conflictCount: columns.length + 1,
      };

      columns[columnIndex].push(eventLayout);
      eventLayouts.push(eventLayout);
    });

    // Calculate final layout properties
    return eventLayouts.map((event) => ({
      ...event,
      columnSpan: 1,
      conflictCount: columns.length,
    }));
  };

  const getEventStyle = (event: EventLayoutInfo) => {
    const startMinutes =
      event.startTime.getHours() * 60 + event.startTime.getMinutes();
    const endMinutes =
      event.endTime.getHours() * 60 + event.endTime.getMinutes();
    const duration = endMinutes - startMinutes;

    const top = (startMinutes / MINUTES_IN_DAY) * (24 * HOUR_HEIGHT);
    const height = (duration / MINUTES_IN_DAY) * (24 * HOUR_HEIGHT);

    const width = 100 / event.conflictCount;
    const left = (width * event.column);

    return {
      top: `${top}px`,
      height: `${height}px`,
      left: `${left}%`,
      width: `${width}%`,
    };
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEventId(event.id);
    setModalMode('edit');
    setEventModalOpen(true);
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="grid grid-cols-[auto_1fr] gap-4">
        {/* Time Labels */}
        <div className="space-y-[56px] pr-4 pt-16">
          {Array.from({ length: 24 }, (_, hour) => (
            <div key={hour} className="text-sm text-muted-foreground h-[60px]">
              {hour === 0 ? '12 AM' : hour < 12 ? `${hour} AM` : hour === 12 ? '12 PM' : `${hour - 12} PM`}
            </div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="grid grid-cols-7 gap-px bg-muted">
          {weekDays.map((day: DayCell) => {
            const dayEvents = events
              .map(event => ({
                ...event,
                id: event._id?.toString() || crypto.randomUUID(),
                startTime: new Date(event.startTime),
                endTime: new Date(event.endTime)
              }))
              .filter(event => event.startTime.toDateString() === day.date.toDateString());
            const layoutEvents = layoutEventsForDay(dayEvents);

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
                <div className="relative h-[1440px]">
                  <AnimatePresence>
                    {layoutEvents.map((event) => {
                      const subject = subjects.find(s => s.id === event.subjectId);
                      const style = getEventStyle(event);

                      return (
                        <TooltipProvider key={event.id}>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <motion.div
                                layoutId={event.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                style={{
                                  ...style,
                                  position: 'absolute',
                                  backgroundColor: subject?.color || event.color || '#BFD5FF',
                                }}
                                onClick={() => handleEventClick(event)}
                                className={cn(
                                  "rounded-md p-2 cursor-pointer overflow-hidden",
                                  "hover:ring-2 hover:ring-primary hover:z-10",
                                  "transition-shadow"
                                )}
                              >
                                <div className="text-xs font-medium truncate">
                                  {event.title}
                                </div>
                                <div className="text-xs opacity-75">
                                  {formatTimeRange(event.startTime, event.endTime)}
                                </div>
                                {event.location && (
                                  <div className="text-xs opacity-75 truncate">
                                    📍 {event.location}
                                  </div>
                                )}
                              </motion.div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <div className="space-y-1">
                                <p className="font-medium">{event.title}</p>
                                <p className="text-xs">
                                  {formatTimeRange(event.startTime, event.endTime)}
                                </p>
                                {event.location && (
                                  <p className="text-xs">📍 {event.location}</p>
                                )}
                                {subject && (
                                  <p className="text-xs flex items-center gap-1">
                                    Subject: {subject.name}
                                    <span
                                      className="w-2 h-2 rounded-full"
                                      style={{ backgroundColor: subject.color }}
                                    />
                                  </p>
                                )}
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      );
                    })}
                  </AnimatePresence>

                  {/* Hour Grid Lines */}
                  {Array.from({ length: 24 }, (_, hour) => (
                    <div
                      key={hour}
                      className="absolute w-full border-t border-muted"
                      style={{ top: `${hour * HOUR_HEIGHT}px` }}
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