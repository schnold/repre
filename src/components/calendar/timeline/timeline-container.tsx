// src/components/calendar/timeline/timeline-container.tsx
'use client';

import React, { useCallback } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { useCalendarStore } from '@/store/calendar-store';
import { CalendarEvent } from '@/lib/types/calendar';
import { formatTimeRange } from '@/lib/utils/date-helpers';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useCalendarContext } from '@/contexts/calendar-context';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { getContrastColor } from '@/lib/utils/color-helpers';

interface GroupedEvents {
  [key: string]: CalendarEvent[];
}

const TimelineContainer = () => {
  const { subjects, setSelectedEventId, setEventModalOpen, setModalMode } = useCalendarStore();
  const { selectedDate, getEventsForMonth } = useCalendarContext();

  const groupedEvents = useCallback(() => {
    const monthEvents = getEventsForMonth(selectedDate).map(event => ({
      ...event,
      id: event._id?.toString() || crypto.randomUUID()
    }));
    return monthEvents.reduce<Record<string, CalendarEvent[]>>((acc, event) => {
      const date = event.startTime.toDateString();
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(event);
      return acc;
    }, {});
  }, [getEventsForMonth, selectedDate]);

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEventId(event.id);
    setModalMode('edit');
    setEventModalOpen(true);
  };

  const sortedDates = Object.keys(groupedEvents()).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime()
  );

  return (
    <div className="h-screen overflow-y-auto p-4 space-y-6">
      <AnimatePresence mode="popLayout">
        {sortedDates.map((date) => (
          <motion.div
            key={date}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Date Header */}
            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm py-2">
              <h3 className="text-lg font-semibold">
                {format(new Date(date), 'EEEE, MMMM d')}
              </h3>
            </div>

            {/* Events */}
            <Reorder.Group
              axis="y"
              values={groupedEvents()[date]}
              onReorder={(newOrder: CalendarEvent[]) => {
                // Implement reorder logic if needed
                console.log('Reorder:', newOrder);
              }}
              className="space-y-2"
            >
              {groupedEvents()[date].map((event) => {
                const subject = subjects.find(s => s.id === event.subjectId);
                const backgroundColor = event.color || subject?.color || '#BFD5FF';
                const textColor = getContrastColor(backgroundColor);

                return (
                  <TooltipProvider key={event.id}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Reorder.Item
                          value={event}
                          dragListener={false}
                        >
                          <motion.div
                            layoutId={event.id}
                            onClick={() => handleEventClick(event)}
                            className={cn(
                              "p-4 rounded-lg border bg-card",
                              "hover:shadow-lg transition-all duration-200 cursor-pointer"
                            )}
                            style={{
                              borderLeftColor: backgroundColor,
                              borderLeftWidth: '4px'
                            }}
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
                              {subject && (
                                <div
                                  className={cn(
                                    "px-2 py-1 text-xs rounded-full",
                                    "flex items-center gap-1"
                                  )}
                                  style={{ 
                                    backgroundColor,
                                    color: textColor
                                  }}
                                >
                                  {subject.name}
                                </div>
                              )}
                            </div>

                            {event.description && (
                              <div className="mt-2 text-sm text-muted-foreground line-clamp-2">
                                {event.description}
                              </div>
                            )}
                          </motion.div>
                        </Reorder.Item>
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
                                           </Reorder.Group>
                                         </motion.div>
                                       ))}
                                     </AnimatePresence>
                                   </div>
                                 );
                               };
                               
                               export default TimelineContainer;