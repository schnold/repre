// src/components/calendar/calendar-view.tsx
"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { useCalendarStore } from '@/store/calendar-store';
import MonthView from './views/month-view';
import WeekView from './views/week-view';
import AgendaView from './views/agenda-view';
import DateNavigator from './calendar-header/date-navigator';
import ViewSwitcher from './calendar-header/view-switcher';
import EventSearchFilter from './calendar-header/event-search-filter';
import EventModal from './events/event-modal';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import SidebarTabs from './calendar-sidebar/sidebar-tabs';
import { CalendarLoading } from './calendar-loading';
import { useCalendarContext } from '@/contexts/calendar-context';

export function CalendarView() {
  const { 
    currentView, 
    setEventModalOpen, 
    setModalMode,
  } = useCalendarStore();

  const handleCreateEvent = () => {
    setModalMode('create');
    setEventModalOpen(true);
  };

  const { isLoading, error } = useCalendarContext();

  return (
    <div className="h-full flex">
      {/* Left Sidebar */}
      <motion.div 
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-64 border-r hidden md:block"
      >
        <SidebarTabs />
      </motion.div>

      {/* Main Calendar Area */}
      <div className="flex-1 flex flex-col min-h-0">
        {/* Calendar Header */}
        <header className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
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
        <main className="flex-1 min-h-0 bg-background p-4">
          <motion.div 
            key={currentView}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            className="h-full"
          >
            {currentView === 'month' && <MonthView />}
            {currentView === 'week' && <WeekView />}
            {currentView === 'agenda' && <AgendaView />}
          </motion.div>
        </main>
      </div>

      {/* Event Modal */}
      <EventModal />
    </div>
  );
}