// src/components/calendar/calendar-view.tsx
"use client";

import React, { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSchedule } from '@/hooks/use-schedule';
import { useToast } from '@/components/ui/use-toast';
import { TimeGrid } from './time-grid/time-grid';
import { IEvent } from '@/lib/db/interfaces';
import { Button } from '@/components/ui/button';
import { Plus, Menu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { EventDialog } from './events/event-dialog';
import { QuickEventDialog } from './events/quick-event-dialog';
import MonthView from './views/month-view';
import WeekView from './views/week-view';
import AgendaView from './views/agenda-view';
import DateNavigator from './calendar-header/date-navigator';
import ViewSwitcher from './calendar-header/view-switcher';
import EventSearchFilter from './calendar-header/event-search-filter';
import SidebarTabs from './calendar-sidebar/sidebar-tabs';
import { useMediaQuery } from '@/hooks/use-media-query';
import { startOfDay, endOfDay, addDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns';
import { useCalendarStore } from '@/store/calendar-store';

export function CalendarView() {
  const { selectedSchedule } = useSchedule();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {
    view,
    setView,
    selectedDate,
    setSelectedDate,
    events,
    setEvents,
    isEventModalOpen,
    setEventModalOpen,
    modalMode,
    setModalMode,
    selectedEvent,
    setSelectedEvent,
    addEvent,
    deleteEvent
  } = useCalendarStore();

  const [isQuickEventDialogOpen, setQuickEventDialogOpen] = useState(false);
  const [quickEventPosition, setQuickEventPosition] = useState<{ x: number; y: number } | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  // Calculate date range based on current view
  const dateRange = useMemo(() => {
    switch (view) {
      case 'day':
        return {
          start: startOfDay(selectedDate),
          end: endOfDay(selectedDate)
        };
      case 'week':
        return {
          start: startOfWeek(selectedDate),
          end: endOfWeek(selectedDate)
        };
      case 'month':
        return {
          start: startOfMonth(selectedDate),
          end: endOfMonth(selectedDate)
        };
      default:
        return {
          start: startOfDay(selectedDate),
          end: addDays(selectedDate, 7)
        };
    }
  }, [view, selectedDate]);

  // Fetch events for the current view
  React.useEffect(() => {
    const fetchEvents = async () => {
      if (!selectedSchedule?._id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(
          `/api/events?scheduleId=${selectedSchedule._id}&startDate=${dateRange.start.toISOString()}&endDate=${dateRange.end.toISOString()}`
        );
        
        if (!response.ok) {
          throw new Error(await response.text() || 'Failed to fetch events');
        }
        
        const data = await response.json();
        setEvents(data);
      } catch (error: any) {
        console.error('Error fetching events:', error);
        setError(error.message);
        toast({
          title: "Error",
          description: error.message || "Failed to fetch events",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, [selectedSchedule?._id, dateRange.start, dateRange.end, setEvents, toast]);

  // Event handlers
  const handleEventUpdate = useCallback(async (event: IEvent) => {
    try {
      const response = await fetch(`/api/events/${event._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        throw new Error('Failed to update event');
      }

      const updatedEvent = await response.json();
      setEvents(events.map(e => e._id === event._id ? updatedEvent : e));
      toast({
        title: "Event Updated",
        description: `Updated "${event.title}"`
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update event"
      });
    }
  }, [events, setEvents, toast]);

  const handleEventCreate = useCallback(async (event: Partial<IEvent>) => {
    if (!selectedSchedule?._id) return;

    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...event,
          scheduleId: selectedSchedule._id
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create event');
      }

      const newEvent = await response.json();
      addEvent(newEvent);
      toast({
        title: "Event Created",
        description: `Created "${event.title}"`
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create event"
      });
    }
  }, [selectedSchedule?._id, addEvent, toast]);

  const handleQuickCreate = useCallback((position: { x: number; y: number }, time: Date) => {
    setSelectedEvent({
      startTime: time,
      endTime: new Date(time.getTime() + 30 * 60000)
    } as IEvent);
    setQuickEventPosition(position);
    setQuickEventDialogOpen(true);
  }, [setSelectedEvent]);

  if (!selectedSchedule) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-4">
        <p className="text-muted-foreground text-center">
          Please select or create a schedule to view events
        </p>
        <Button 
          onClick={() => {/* TODO: Add schedule creation dialog */}} 
          variant="outline"
        >
          Create Schedule
        </Button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 p-4">
        <p className="text-destructive">Error: {error}</p>
        <Button 
          onClick={() => window.location.reload()} 
          variant="outline"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex bg-slate-950">
      {/* Mobile Sidebar Toggle */}
      {!isDesktop && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed bottom-4 right-4 z-50 md:hidden"
          onClick={() => setSidebarOpen(prev => !prev)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      )}

      {/* Left Sidebar */}
      <AnimatePresence mode="wait">
        {(isSidebarOpen || isDesktop) && (
          <motion.div 
            initial={{ x: -320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -320, opacity: 0 }}
            transition={{ type: "spring", damping: 20 }}
            className={cn(
              "w-64 border-r bg-background",
              isDesktop ? "relative" : "fixed inset-0 z-50"
            )}
          >
            <SidebarTabs />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Calendar Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Calendar Header */}
        <header className="flex flex-col sm:flex-row items-center justify-between p-4 gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <DateNavigator
              date={selectedDate}
              onDateChange={setSelectedDate}
              view={view}
            />
            <Button onClick={() => setEventModalOpen(true)} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Create Event</span>
              <span className="sm:hidden">New</span>
            </Button>
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <EventSearchFilter />
            <ViewSwitcher
              view={view}
              onViewChange={setView}
            />
          </div>
        </header>

        {/* Calendar Content */}
        <main className="flex-1 min-h-0 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div 
                key={`${view}-${selectedDate.valueOf()}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.2 }}
                className="h-full"
              >
                {view === 'month' && <MonthView />}
                {view === 'week' && <WeekView />}
                {view === 'day' && (
                  <TimeGrid
                    events={events}
                    onEventUpdate={handleEventUpdate}
                    onEventCreate={handleQuickCreate}
                    view={view}
                    selectedDate={selectedDate}
                  />
                )}
                {view === 'agenda' && <AgendaView />}
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>

      {/* Event Dialogs */}
      <EventDialog
        event={selectedEvent}
        isOpen={isEventModalOpen}
        onClose={() => {
          setEventModalOpen(false);
          setSelectedEvent(null);
        }}
        onSave={handleEventCreate}
      />

      <QuickEventDialog
        event={selectedEvent}
        isOpen={isQuickEventDialogOpen}
        position={quickEventPosition}
        onClose={() => {
          setQuickEventDialogOpen(false);
          setSelectedEvent(null);
          setQuickEventPosition(null);
        }}
        onSave={handleEventCreate}
      />
    </div>
  );
}