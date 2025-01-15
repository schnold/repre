// src/components/calendar/views/month-view.tsx
import React, { useRef } from 'react';
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
import { 
  UserCheck, 
  ChevronLeft, 
  ChevronRight,
  Plus
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getContrastColor } from '@/lib/utils/color-helpers';
import { EventMenu } from "@/components/calendar/events/event-menu";
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { toast } from "@/components/ui/use-toast";

const MonthView: React.FC = () => {
  const { 
    selectedDate, 
    events, 
    setSelectedEventId, 
    setEventModalOpen, 
    setModalMode,
    setSelectedDate,
    subjects,
    deleteEvent,
    addEvent 
  } = useCalendarStore();

  const { teachers } = useTeacherStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const days = getMonthDays(selectedDate);

  const handleNavigateMonth = (direction: 'previous' | 'next') => {
    const newDate = new Date(selectedDate);
    if (direction === 'next') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setSelectedDate(newDate);
  };

  const getTeacherInfo = (teacherId: string | undefined) => {
    if (!teacherId) return null;
    return teachers.find(t => t.id === teacherId);
  };

  const getEventsForDay = (date: Date): CalendarEvent[] => {
    return events
      .map(event => ({
        ...event,
        id: event._id?.toString() || crypto.randomUUID(),
        startTime: new Date(event.startTime),
        endTime: new Date(event.endTime)
      }))
      .filter((event) => 
        event.startTime.toDateString() === date.toDateString()
      )
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  };

  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEventId(event.id);
    setModalMode('edit');
    setEventModalOpen(true);
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setModalMode('create');
    setEventModalOpen(true);
  };

  const handleUpdateEvent = (eventId: string, updates: Partial<any>) => {
    const event = events.find(e => e._id === eventId);
    if (!event) return;

    const updatedEvent = {
      ...event,
      ...updates,
    };
    deleteEvent(eventId);
    addEvent(updatedEvent);
  };

  const handleDeleteEvent = async (event: any) => {
    try {
      // Delete from database
      const response = await fetch(`/api/events/${event._id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete event');
      }

      // Delete from frontend state
      deleteEvent(event._id);

      toast({
        title: "Event Deleted",
        description: "Successfully deleted event",
      });
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Error",
        description: "Failed to delete event",
        variant: "destructive",
      });
    }
  };

  const renderEventCard = (event: CalendarEvent) => {
    const teacher = getTeacherInfo(event.teacherId);
    const substitute = getTeacherInfo(event.substituteTeacherId);
    const hasSubstitute = !!event.substituteTeacherId;
    const subject = subjects.find(s => s.id === event.subjectId);
    const backgroundColor = event.color || subject?.color || teacher?.color || '#BFD5FF';
    const textColor = getContrastColor(backgroundColor);

    return (
      <DropdownMenu key={event._id}>
        <DropdownMenuTrigger asChild>
          <motion.div
            layoutId={event._id}
            onClick={(e) => e.stopPropagation()}
            className={cn(
              "px-2 py-1 text-xs rounded-md truncate cursor-pointer",
              "hover:opacity-80 transition-opacity",
              "flex items-center gap-1 group"
            )}
            style={{ 
              backgroundColor,
              color: textColor
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
        </DropdownMenuTrigger>
        <EventMenu 
          event={event}
          onUpdate={handleUpdateEvent}
          onDelete={handleDeleteEvent}
        />
      </DropdownMenu>
    );
  };

  return (
    <div className="h-full flex flex-col" ref={containerRef}>
      {/* Month Navigator */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">
          {selectedDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h2>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleNavigateMonth('previous')}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => setSelectedDate(new Date())}
          >
            Today
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => handleNavigateMonth('next')}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-px bg-muted rounded-lg overflow-hidden border flex-1">
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
          const isSelected = selectedDate.toDateString() === day.date.toDateString();

          return (
            <motion.div
              key={day.date.toISOString()}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.02 }}
              onClick={() => handleDayClick(day.date)}
              className={cn(
                "min-h-[120px] p-2 bg-background relative group hover:bg-muted/50 transition-colors cursor-pointer",
                !day.isCurrentMonth && "bg-muted/5 text-muted-foreground",
                day.isToday && "ring-2 ring-primary ring-inset",
                isSelected && "bg-primary/5"
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

              {/* Add Event Button (visible on hover) */}
              <Button
                size="icon"
                variant="ghost"
                className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedDate(day.date);
                  setModalMode('create');
                  setEventModalOpen(true);
                }}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default MonthView;