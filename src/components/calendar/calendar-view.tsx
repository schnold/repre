// src/components/calendar/calendar-view.tsx
"use client";

import React, { useCallback, useMemo, useState, useEffect } from 'react';
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
import { ScheduleSelector } from '@/components/calendar/events/schedule-selector';
import { useParams } from 'next/navigation';
import { useOrganizations } from '@/hooks/use-organizations';
import { useSelectedOrganization } from '@/hooks/use-selected-organization';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ViewSelect } from './calendar-header/view-select';
import { DatePicker } from './calendar-header/date-picker';
import { Types } from 'mongoose';
import { CalendarView as ViewType } from '@/store/calendar-store';

export function CalendarView() {
  const params = useParams();
  const organizationId = params?.id as string;
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { currentOrg } = useOrganizations();
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
    deleteEvent,
    setSelectedSchedule,
    schedules,
    setSchedules,
    selectedSchedule
  } = useCalendarStore();

  const [isQuickEventDialogOpen, setQuickEventDialogOpen] = useState(false);
  const [quickEventPosition, setQuickEventPosition] = useState<{ x: number; y: number } | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const { selectedOrganization, isLoading: isLoadingOrg } = useSelectedOrganization();

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

  const fetchEvents = useCallback(async () => {
    if (!selectedOrganization?._id || !selectedSchedule?._id) return;

    try {
      const response = await fetch(
        `/api/organizations/${selectedOrganization._id}/schedules/${selectedSchedule._id}/events?startDate=${dateRange.start.toISOString()}&endDate=${dateRange.end.toISOString()}`
      );

      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }

      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast({
        title: "Error",
        description: "Failed to load events",
        variant: "destructive",
      });
    }
  }, [selectedOrganization?._id, selectedSchedule?._id, dateRange, setEvents, toast]);

  // Fetch events when schedule, date range, or organization changes
  useEffect(() => {
    if (selectedSchedule?._id) {
      fetchEvents();
    }
  }, [selectedSchedule?._id, dateRange, fetchEvents]);

  // Fetch schedules when organization changes
  useEffect(() => {
    const fetchSchedules = async () => {
      if (!selectedOrganization?._id) return;
      
      try {
        setIsLoading(true);
        const response = await fetch(`/api/organizations/${selectedOrganization._id}/schedules`);
        if (!response.ok) {
          throw new Error('Failed to fetch schedules');
        }
        const data = await response.json();
        setSchedules(data);
        if (data.length > 0 && !selectedSchedule) {
          setSelectedSchedule(data[0]);
        }
      } catch (error) {
        console.error('Error fetching schedules:', error);
        toast({
          title: "Error",
          description: "Failed to load schedules",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedules();
  }, [selectedOrganization?._id, setSchedules, setSelectedSchedule, selectedSchedule, toast]);

  // Event handlers
  const handleEventUpdate = useCallback(async (event: Partial<IEvent>) => {
    if (!selectedOrganization?._id || !selectedSchedule?._id) return;

    try {
      const response = await fetch(`/api/organizations/${selectedOrganization._id}/schedules/${selectedSchedule._id}/events/${event._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        throw new Error('Failed to update event');
      }

      await fetchEvents();
      toast({
        title: "Event Updated",
        description: `Updated "${event.title}"`
      });
    } catch (error) {
      console.error('Error updating event:', error);
      toast({
        title: "Error",
        description: "Failed to update event",
        variant: "destructive",
      });
    }
  }, [selectedOrganization?._id, selectedSchedule?._id, fetchEvents, toast]);

  const handleEventCreate = useCallback(async (event: Partial<IEvent>) => {
    if (!selectedOrganization?._id || !selectedSchedule?._id) return;

    try {
      const response = await fetch(`/api/organizations/${selectedOrganization._id}/schedules/${selectedSchedule._id}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        throw new Error('Failed to create event');
      }

      await fetchEvents();
      toast({
        title: "Event Created",
        description: `Created "${event.title}"`
      });
    } catch (error) {
      console.error('Error creating event:', error);
      toast({
        title: "Error",
        description: "Failed to create event",
        variant: "destructive",
      });
    }
  }, [selectedOrganization?._id, selectedSchedule?._id, fetchEvents, toast]);

  const handleQuickCreate = useCallback((position: { x: number; y: number }, time: Date) => {
    setSelectedEvent({
      startTime: time,
      endTime: new Date(time.getTime() + 30 * 60000)
    } as IEvent);
    setQuickEventPosition(position);
    setQuickEventDialogOpen(true);
  }, [setSelectedEvent]);

  if (isLoadingOrg) {
    return <div>Loading...</div>;
  }

  if (!selectedOrganization) {
    return (
      <Alert>
        <AlertDescription>
          Please select an organization from the dropdown menu to view the calendar.
        </AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
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
    <div className="flex h-full">
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 300, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="border-r"
          >
            <SidebarTabs />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!isSidebarOpen)}
            >
              <Menu className="h-4 w-4" />
            </Button>
            <DateNavigator 
              date={selectedDate}
              onDateChange={setSelectedDate}
              view={view as ViewType}
            />
          </div>

          <div className="flex items-center gap-4">
            <ViewSelect 
              view={view as ViewType}
              onViewChange={setView}
            />
            <DatePicker 
              date={selectedDate}
              onDateChange={setSelectedDate}
            />
            <EventSearchFilter />
            {selectedSchedule && (
              <Button
                onClick={() => {
                  setSelectedEvent(null);
                  setModalMode('create');
                  setEventModalOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Event
              </Button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {selectedSchedule ? (
            <>
              {view === 'month' && <MonthView />}
              {view === 'week' && <WeekView />}
              {view === 'day' && <TimeGrid />}
              {view === 'agenda' && <AgendaView />}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-4 p-4">
              <p>No schedule selected</p>
              <ScheduleSelector 
                organizationId={selectedOrganization._id.toString()}
                onScheduleSelect={(scheduleId: string) => {
                  const schedule = schedules.find(s => s._id.toString() === scheduleId);
                  if (schedule) {
                    setSelectedSchedule(schedule);
                  }
                }}
              />
            </div>
          )}
        </div>
      </div>

      <EventDialog
        event={selectedEvent ? {
          ...selectedEvent,
          _id: typeof selectedEvent._id === 'string' ? new Types.ObjectId(selectedEvent._id) : selectedEvent._id
        } : null}
        isOpen={isEventModalOpen}
        onClose={() => setEventModalOpen(false)}
        onSave={modalMode === 'create' ? handleEventCreate : handleEventUpdate}
        scheduleId={selectedSchedule?._id.toString() || ''}
      />

      <QuickEventDialog
        event={selectedEvent ? {
          ...selectedEvent,
          _id: typeof selectedEvent._id === 'string' ? new Types.ObjectId(selectedEvent._id) : selectedEvent._id
        } : null}
        isOpen={isQuickEventDialogOpen}
        position={quickEventPosition}
        onClose={() => setQuickEventDialogOpen(false)}
        onSave={handleEventCreate}
        scheduleId={selectedSchedule?._id.toString() || ''}
      />
    </div>
  );
}