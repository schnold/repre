'use client'

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { useCalendarStore } from '@/store/calendar-store';
import { CalendarEvent } from '@/lib/types/calendar';
import { formatTimeRange } from '@/lib/utils/date-helpers';
import { cn } from '@/lib/utils';

interface GroupedEvents {
  [key: string]: CalendarEvent[];
}

const TimelineContainer: React.FC = () => {
  const { events } = useCalendarStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [draggingEvent, setDraggingEvent] = useState<string | null>(null);

  // Group events by date with proper typing
  const groupedEvents: GroupedEvents = events.reduce((acc: GroupedEvents, event: CalendarEvent) => {
    const date = event.startTime.toDateString();
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(event);
    return acc;
  }, {});

  return (
    <div 
      ref={containerRef}
      className="h-full overflow-y-auto p-4 space-y-6"
    >
      {Object.entries(groupedEvents).map(([date, dateEvents]: [string, CalendarEvent[]]) => (
        <motion.div
          key={date}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm py-2">
            <h3 className="text-lg font-semibold">
              {new Date(date).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })}
            </h3>
          </div>

          <Reorder.Group
            axis="y"
            values={dateEvents}
            onReorder={(newOrder: CalendarEvent[]) => {
              // We'll implement reordering in a future update
              console.log('Reorder:', newOrder);
            }}
            className="space-y-2"
          >
            <AnimatePresence>
              {dateEvents.map((event: CalendarEvent) => (
                <Reorder.Item
                  key={event.id}
                  value={event}
                  dragListener={false}
                >
                  <motion.div
                    layoutId={event.id}
                    drag="y"
                    dragConstraints={containerRef}
                    onDragStart={() => setDraggingEvent(event.id)}
                    onDragEnd={() => setDraggingEvent(null)}
                    className={cn(
                      "p-4 rounded-lg border bg-card",
                      "hover:shadow-lg transition-all duration-200",
                      draggingEvent === event.id && "shadow-xl ring-2 ring-primary",
                      "cursor-grab active:cursor-grabbing"
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <h4 className="font-medium truncate">{event.title}</h4>
                        <div className="mt-1 text-sm text-muted-foreground">
                          {formatTimeRange(event.startTime, event.endTime)}
                        </div>
                        {event.location && (
                          <div className="mt-1 text-sm text-muted-foreground truncate">
                            📍 {event.location}
                          </div>
                        )}
                      </div>
                      <div className={cn(
                        "px-2 py-1 text-xs rounded-full",
                        "bg-primary/10 text-primary"
                      )}>
                        {event.category}
                      </div>
                    </div>

                    {event.description && (
                      <div className="mt-2 text-sm text-muted-foreground line-clamp-2">
                        {event.description}
                      </div>
                    )}

                    <motion.div
                      className="absolute inset-x-0 bottom-0 h-1 bg-primary/10 rounded-full"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: 0.5 }}
                    />
                  </motion.div>
                </Reorder.Item>
              ))}
            </AnimatePresence>
          </Reorder.Group>
        </motion.div>
      ))}
    </div>
  );
};

export default TimelineContainer;