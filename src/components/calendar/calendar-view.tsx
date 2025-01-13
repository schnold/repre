// src/components/calendar/calendar-view.tsx
"use client";

import React, { useCallback, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOrganizationData } from '@/hooks/use-organization-data';
import { useCalendarEventsQuery } from '@/hooks/use-calendar-events-query';
import { TimeGrid } from './time-grid/time-grid';
import { useToast } from '@/components/ui/use-toast';
import { TimeGridConfig } from '@/hooks/use-time-grid';
import { IEvent } from '@/lib/db/schemas';
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
import { useQuery } from '@tanstack/react-query';

interface CalendarViewProps {
  organizationId?: string;
}

export function CalendarView({ organizationId }: CalendarViewProps) {
  const { data: orgData, isLoading: orgLoading } = useOrganizationData();
  const { toast } = useToast();
  const [currentView, setCurrentView] = useState<'day' | 'week' | 'month' | 'agenda'>('day');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [isEventDialogOpen, setEventDialogOpen] = useState(false);
  const [isQuickEventDialogOpen, setQuickEventDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Partial<IEvent> | null>(null);
  const [quickEventPosition, setQuickEventPosition] = useState<{ x: number; y: number } | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const { fetchEvents, createEvent, updateEvent, deleteEvent } = useCalendarEventsQuery();

  // Calculate date range based on current view
  const dateRange = useMemo(() => {
    switch (currentView) {
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
  }, [currentView, selectedDate]);

  // Fetch events for the current view
  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['events', organizationId, dateRange.start, dateRange.end],
    queryFn: () => fetchEvents({
      startDate: dateRange.start,
      endDate: dateRange.end
    }),
    enabled: !!organizationId && !orgLoading
  });

  // Event handlers
  const handleEventUpdate = useCallback(async (event: IEvent) => {
    try {
      await updateEvent.mutateAsync(event);
      toast({
        title: "Event Updated",
        children: `Updated "${event.title}"`
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        children: "Failed to update event"
      });
    }
  }, [updateEvent, toast]);

  const handleEventCreate = useCallback(async (event: Partial<IEvent>) => {
    try {
      await createEvent.mutateAsync(event);
      toast({
        title: "Event Created",
        children: `Created "${event.title}"`
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        children: "Failed to create event"
      });
    }
  }, [createEvent, toast]);

  const handleQuickCreate = useCallback((position: { x: number; y: number }, time: Date) => {
    setSelectedEvent({
      startTime: time,
      endTime: new Date(time.getTime() + 30 * 60000)
    });
    setQuickEventPosition(position);
    setQuickEventDialogOpen(true);
  }, []);

  // Memoize the TimeGrid props
  const timeGridProps = useMemo(() => ({
    events,
    teachers: orgData?.teachers ?? [],
    subjects: orgData?.subjects ?? [],
    onEventUpdate: handleEventUpdate,
    onEventCreate: handleQuickCreate,
    view: currentView,
    selectedDate,
    gridConfig: {
      startHour: 7,
      endHour: 19,
      minTimeIncrement: 15,
      zoomLevel: 1.5,
      scale: '30minutes' as const,
      columnCount: currentView === 'day' ? (orgData?.teachers?.length ?? 1) : 1
    } satisfies TimeGridConfig
  }), [events, orgData, handleEventUpdate, handleQuickCreate, currentView, selectedDate]);

  if (orgLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-slate-950">
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
              view={currentView}
            />
            <Button onClick={() => setEventDialogOpen(true)} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Create Event</span>
              <span className="sm:hidden">New</span>
            </Button>
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <EventSearchFilter />
            <ViewSwitcher
              view={currentView}
              onViewChange={setCurrentView}
            />
          </div>
        </header>

        {/* Calendar Content */}
        <main className="flex-1 min-h-0 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div 
              key={`${currentView}-${selectedDate.valueOf()}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {currentView === 'month' && <MonthView events={events} />}
              {currentView === 'week' && <WeekView events={events} />}
              {currentView === 'day' && <TimeGrid {...timeGridProps} />}
              {currentView === 'agenda' && <AgendaView events={events} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Event Dialogs */}
      <EventDialog
        event={selectedEvent}
        teachers={orgData?.teachers ?? []}
        subjects={orgData?.subjects ?? []}
        isOpen={isEventDialogOpen}
        onClose={() => {
          setEventDialogOpen(false);
          setSelectedEvent(null);
        }}
        onSave={handleEventCreate}
      />

      <QuickEventDialog
        event={selectedEvent}
        teachers={orgData?.teachers ?? []}
        subjects={orgData?.subjects ?? []}
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