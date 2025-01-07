"use client";

import React, { useEffect } from 'react';
import { useCalendarStore } from '@/store/calendar-store';
import { CalendarEvent } from '@/lib/types/calendar';
import MonthView from './views/month-view';
import WeekView from './views/week-view';
import AgendaView from './views/agenda-view';
import DateNavigator from './calendar-header/date-navigator';
import ViewSwitcher from './calendar-header/view-switcher';
import EventSearchFilter from './calendar-header/event-search-filter';
import EventModal from './events/event-modal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

// Sample test events with proper typing
const testEvents: CalendarEvent[] = [
  {
    id: crypto.randomUUID(),
    title: 'Team Meeting',
    startTime: new Date(new Date().setHours(10, 0, 0, 0)),
    endTime: new Date(new Date().setHours(11, 0, 0, 0)),
    category: 'work',
    location: 'Conference Room A',
    description: 'Weekly team sync',
    isRecurring: false
  },
  {
    id: crypto.randomUUID(),
    title: 'Project Review',
    startTime: new Date(new Date().setHours(14, 0, 0, 0)),
    endTime: new Date(new Date().setHours(15, 30, 0, 0)),
    category: 'important',
    location: 'Main Office',
    description: 'Q1 Project Review',
    isRecurring: false
  },
  {
    id: crypto.randomUUID(),
    title: 'Lunch Break',
    startTime: new Date(new Date().setHours(12, 0, 0, 0)),
    endTime: new Date(new Date().setHours(13, 0, 0, 0)),
    category: 'personal',
    isRecurring: true
  }
];

const RepreApp = () => {
  const { 
    currentView, 
    addEvent, 
    setEventModalOpen, 
    setModalMode,
    clearEvents 
  } = useCalendarStore();

  // Initialize test events
  useEffect(() => {
    // Clear existing events before adding test events
    clearEvents();
    testEvents.forEach(event => addEvent(event));
  }, [addEvent, clearEvents]);

  const handleCreateEvent = () => {
    setModalMode('create');
    setEventModalOpen(true);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Calendar Header */}
      <header className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-4">
          <DateNavigator />
          <Button onClick={handleCreateEvent} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        </div>
        <div className="flex items-center gap-4">
          <EventSearchFilter />
          <ViewSwitcher />
        </div>
      </header>

      {/* Calendar Content */}
      <main className="flex-1 overflow-hidden">
        {currentView === 'month' && <MonthView />}
        {currentView === 'week' && <WeekView />}
        {currentView === 'agenda' && <AgendaView />}
      </main>

      {/* Event Modal */}
      <EventModal />
    </div>
  );
};

export default RepreApp;