import React from 'react';
import { useCalendarStore } from '@/store/calendar-store';
import { CalendarEvent } from '@/lib/types/calendar';
import { formatTimeRange, formatFullDate } from '@/lib/utils/date-helpers';
import { motion } from 'framer-motion';
import TimelineContainer from '../timeline/timeline-container';
import TimelineCard from '../timeline/timeline-card';

const AgendaView: React.FC = () => {
  const { events, dateRange } = useCalendarStore();

  // Filter events within the selected date range
  const filteredEvents = events
    .filter((event: CalendarEvent) => 
      event.startTime >= dateRange.start && 
      event.startTime <= dateRange.end
    )
    .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

  // Group events by date
  const groupedEvents = filteredEvents.reduce((groups: Record<string, CalendarEvent[]>, event) => {
    const dateKey = event.startTime.toDateString();
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(event);
    return groups;
  }, {});

  return (
    <div className="h-full overflow-y-auto p-4">
      {Object.entries(groupedEvents).map(([dateKey, dayEvents], groupIndex) => (
        <motion.div
          key={dateKey}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: groupIndex * 0.05 }}
          className="mb-6"
        >
          <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm py-2 mb-3">
            <h3 className="text-lg font-semibold">
              {formatFullDate(new Date(dateKey))}
            </h3>
          </div>
          
          <div className="space-y-3">
            {dayEvents.map((event: CalendarEvent) => (
              <TimelineCard
                key={event.id}
                title={event.title}
                startTime={formatTimeRange(event.startTime, event.endTime)}
                endTime=""
                location={event.location}
                category={event.category}
                description={event.description}
                className="transform transition-all hover:scale-[1.02]"
              />
            ))}
          </div>
        </motion.div>
      ))}

      {Object.keys(groupedEvents).length === 0 && (
        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
          <p>No events scheduled</p>
        </div>
      )}
    </div>
  );
};

export default AgendaView;