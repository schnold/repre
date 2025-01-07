import React from 'react';
import { useCalendarStore } from '@/store/calendar-store';
import { useTeacherStore } from '@/store/teacher-store';
import { getMonthDays, formatDayHeader } from '@/lib/utils/date-helpers';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { CalendarEvent, DayCell } from '@/lib/types/calendar';
import { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
} from '@/components/ui/tooltip';
import { UserCheck } from 'lucide-react';

const MonthView: React.FC = () => {
  const { selectedDate, events, setSelectedEventId, setEventModalOpen, setModalMode } = useCalendarStore();
  const { teachers } = useTeacherStore();
  const days = getMonthDays(selectedDate);

  const getTeacherInfo = (teacherId: string | undefined) => {
    if (!teacherId) return null;
    return teachers.find(t => t.id === teacherId);
  };

  const getEventsForDay = (date: Date): CalendarEvent[] => {
    return events.filter((event: CalendarEvent) => 
      event.startTime.toDateString() === date.toDateString()
    );
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEventId(event.id);
    setModalMode('edit');
    setEventModalOpen(true);
  };

  const renderEventCard = (event: CalendarEvent) => {
    const teacher = getTeacherInfo(event.teacherId);
    const substitute = getTeacherInfo(event.substituteTeacherId);
    const hasSubstitute = !!event.substituteTeacherId;

    return (
      <TooltipProvider key={event.id}>
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              layoutId={event.id}
              onClick={() => handleEventClick(event)}
              className={cn(
                "px-2 py-1 text-xs rounded-md truncate cursor-pointer",
                "hover:opacity-80 transition-opacity",
                "flex items-center gap-1"
              )}
              style={{ 
                backgroundColor: event.color || teacher?.color || '#BFD5FF',
                color: '#000000' 
              }}
            >
              <span className="truncate flex-1">{event.title}</span>
              {hasSubstitute ? (
                <UserCheck className="h-3 w-3 flex-shrink-0" />
              ) : teacher ? (
                <div 
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ backgroundColor: teacher.color }}
                />
              ) : null}
            </motion.div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="font-medium">{event.title}</p>
              <p className="text-xs">
                {event.startTime.toLocaleTimeString()} - {event.endTime.toLocaleTimeString()}
              </p>
              {teacher && (
                <p className="text-xs flex items-center gap-1">
                  Teacher: {teacher.name}
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: teacher.color }} />
                </p>
              )}
              {substitute && (
                <p className="text-xs flex items-center gap-1">
                  Substitute: {substitute.name}
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: substitute.color }} />
                </p>
              )}
              {event.location && (
                <p className="text-xs">Location: {event.location}</p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
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
          const hasSubstitutions = dayEvents.some(e => e.substituteTeacherId);

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
                
                <div className="flex items-center gap-1">
                  {hasSubstitutions && (
                    <UserCheck className="h-4 w-4 text-primary" />
                  )}
                  {dayEvents.length > 0 && (
                    <span className="flex h-5 w-5 items-center justify-center text-xs text-primary bg-primary/10 rounded-full">
                      {dayEvents.length}
                    </span>
                  )}
                </div>
              </div>

              <AnimatePresence mode="popLayout">
                <div className="mt-2 space-y-1">
                  {dayEvents.slice(0, 3).map((event: CalendarEvent) => renderEventCard(event))}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-muted-foreground px-2">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthView;