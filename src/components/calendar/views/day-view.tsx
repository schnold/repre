// src/components/calendar/views/day-view.tsx
"use client";

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useCalendarStore } from '@/store/calendar-store';
import { useCalendarContext } from '@/contexts/calendar-context';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { format, addMinutes } from 'date-fns';
import { getContrastColor } from '@/lib/utils/color-helpers';
import { Calendar, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CalendarEvent } from '@/lib/types/calendar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const HOUR_HEIGHT = 60; // pixels per hour
const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => i);

interface EventWithPosition extends CalendarEvent {
  top: number;
  height: number;
  width: number;
  left: number;
}

const DayView: React.FC = () => {
  const { selectedDate, events, setSelectedEventId, setEventModalOpen, setModalMode, subjects, setSelectedDate } = useCalendarStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [hoveredHour, setHoveredHour] = useState<number | null>(null);

  // Update current time every minute
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Get events for the selected day
  const dayEvents = useMemo(() => {
    return events.filter(event =>
      event.startTime.toDateString() === selectedDate.toDateString()
    ).sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }, [events, selectedDate]);

  // Calculate event positions
  const positionedEvents = useMemo(() => {
    const eventsWithPosition: EventWithPosition[] = [];
    const columns: { start: number; end: number }[][] = [];

    dayEvents.forEach(event => {
      const startMinutes = event.startTime.getHours() * 60 + event.startTime.getMinutes();
      const endMinutes = event.endTime.getHours() * 60 + event.endTime.getMinutes();
      
      // Find a column where the event fits
      let columnIndex = 0;
      let foundColumn = false;

      while (!foundColumn) {
        if (!columns[columnIndex]) {
          columns[columnIndex] = [];
          foundColumn = true;
        } else {
          const hasOverlap = columns[columnIndex].some(
            existingEvent => 
              startMinutes < existingEvent.end && 
              endMinutes > existingEvent.start
          );

          if (!hasOverlap) {
            foundColumn = true;
          } else {
            columnIndex++;
          }
        }
      }

      columns[columnIndex].push({ start: startMinutes, end: endMinutes });

      // Calculate position
      const top = (startMinutes / (24 * 60)) * (24 * HOUR_HEIGHT);
      const height = ((endMinutes - startMinutes) / (24 * 60)) * (24 * HOUR_HEIGHT);
      const width = 100 / (columns.length);
      const left = columnIndex * width;

      eventsWithPosition.push({
        ...event,
        top,
        height,
        width,
        left
      });
    });

    return eventsWithPosition;
  }, [dayEvents]);

  const handleEventClick = (event: EventWithPosition) => {
    setSelectedEventId(event.id);
    setModalMode('edit');
    setEventModalOpen(true);
  };

  const handleTimeSlotClick = (hour: number) => {
    const newEventStart = new Date(selectedDate);
    newEventStart.setHours(hour, 0, 0, 0);
    
    setSelectedDate(newEventStart);
    setModalMode('create');
    setEventModalOpen(true);
  };

  const getCurrentTimePosition = () => {
    const minutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    return (minutes / (24 * 60)) * (24 * HOUR_HEIGHT);
  };

  // Scroll to current time on mount
  useEffect(() => {
    if (containerRef.current) {
      const currentHour = new Date().getHours();
      const scrollPosition = (currentHour - 1) * HOUR_HEIGHT;
      containerRef.current.scrollTop = scrollPosition;
    }
  }, []);

  return (
    <div className="h-full flex flex-col">
      {/* Day header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </h2>
        </div>
      </div>

      {/* Time grid */}
      <div className="flex-1 overflow-auto" ref={containerRef}>
        <div className="relative grid grid-cols-[auto_1fr] gap-4">
          {/* Time labels */}
          <div className="sticky left-0 bg-background z-20">
            <div className="w-16">
              {TIME_SLOTS.map(hour => (
                <div
                  key={hour}
                  className="flex items-center justify-end pr-2 h-[60px] text-sm text-muted-foreground"
                >
                  {format(new Date().setHours(hour, 0), 'h a')}
                </div>
              ))}
            </div>
          </div>

          {/* Events area */}
          <div className="relative min-h-[1440px]">
            {/* Hour grid lines */}
            {TIME_SLOTS.map(hour => (
              <div
                key={hour}
                className={cn(
                  "absolute w-full border-t border-muted transition-colors",
                  hoveredHour === hour && "bg-muted/50"
                )}
                style={{ top: `${hour * HOUR_HEIGHT}px`, height: `${HOUR_HEIGHT}px` }}
                onMouseEnter={() => setHoveredHour(hour)}
                onMouseLeave={() => setHoveredHour(null)}
                onClick={() => handleTimeSlotClick(hour)}
              />
            ))}

            {/* Current time indicator */}
            {selectedDate.toDateString() === new Date().toDateString() && (
              <div
                className="absolute w-full flex items-center gap-2 z-10 pl-2"
                style={{ top: `${getCurrentTimePosition()}px` }}
              >
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                <div className="flex-1 border-t border-primary" />
              </div>
            )}

            {/* Events */}
            <AnimatePresence>
              {positionedEvents.map(event => {
                const subject = subjects.find(s => s.id === event.subjectId);
                const backgroundColor = event.color || subject?.color || '#BFD5FF';
                const textColor = getContrastColor(backgroundColor);

                return (
                  <TooltipProvider key={event.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <motion.div
                          layoutId={event.id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.9 }}
                          onClick={() => handleEventClick(event)}
                          className={cn(
                            "absolute rounded-md p-2",
                            "hover:ring-2 hover:ring-primary hover:z-10",
                            "transition-shadow cursor-pointer overflow-hidden"
                          )}
                          style={{
                            top: `${event.top}px`,
                            height: `${event.height}px`,
                            left: `${event.left}%`,
                            width: `${event.width}%`,
                            backgroundColor,
                            color: textColor
                          }}
                        >
                          <div className="text-sm font-medium">{event.title}</div>
                          <div className="flex items-center gap-1 text-xs mt-1">
                            <Clock className="w-3 h-3" />
                            <span>
                              {format(event.startTime, 'h:mm a')} - {format(event.endTime, 'h:mm a')}
                            </span>
                          </div>
                          {event.location && (
                            <div className="text-xs mt-1 truncate">
                              📍 {event.location}
                            </div>
                          )}
                        </motion.div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="space-y-1">
                          <p className="font-medium">{event.title}</p>
                          <p className="text-xs">
                            {format(event.startTime, 'h:mm a')} - {format(event.endTime, 'h:mm a')}
                          </p>
                          {subject && (
                            <p className="text-xs flex items-center gap-1">
                              {subject.name}
                              <span 
                                className="w-2 h-2 rounded-full"
                                style={{ backgroundColor: subject.color }} 
                              />
                            </p>
                          )}
                          {event.location && (
                            <p className="text-xs">📍 {event.location}</p>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })}
            </AnimatePresence>

            {/* Quick add button on hover */}
            {hoveredHour !== null && (
              <Button
                size="sm"
                className="absolute right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ top: `${hoveredHour * HOUR_HEIGHT + HOUR_HEIGHT/2 - 12}px` }}
                onClick={() => handleTimeSlotClick(hoveredHour)}
              >
                Add Event
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DayView;