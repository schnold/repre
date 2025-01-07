// src/components/calendar/calendar-view.tsx
"use client";

import React, { useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCalendarStore } from '@/store/calendar-store';
import MonthView from './views/month-view';
import WeekView from './views/week-view';
import AgendaView from './views/agenda-view';
import DateNavigator from './calendar-header/date-navigator';
import ViewSwitcher from './calendar-header/view-switcher';
import EventSearchFilter from './calendar-header/event-search-filter';
import EventModal from './events/event-modal';
import { Button } from '@/components/ui/button';
import { Plus, Menu } from 'lucide-react';
import SidebarTabs from './calendar-sidebar/sidebar-tabs';
import { useCalendarContext } from '@/contexts/calendar-context';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useMediaQuery } from '@/hooks/use-media-query';

export function CalendarView() {
  const { 
    currentView, 
    setEventModalOpen, 
    setModalMode,
    selectedDate,
  } = useCalendarStore();

  const { isLoading, error, events } = useCalendarContext();
  const [isSidebarOpen, setSidebarOpen] = React.useState(true);
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const handleCreateEvent = useCallback(() => {
    setModalMode('create');
    setEventModalOpen(true);
  }, [setModalMode, setEventModalOpen]);

  const toggleSidebar = useCallback(() => {
    setSidebarOpen(prev => !prev);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <Alert variant="destructive" className="m-4">
        <AlertDescription>
          Failed to load calendar: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="h-full flex">
      {/* Mobile Sidebar Toggle */}
      {!isDesktop && (
        <Button
          variant="ghost"
          size="icon"
          className="fixed bottom-4 right-4 z-50 md:hidden"
          onClick={toggleSidebar}
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
            className={`
              ${isDesktop ? 'w-64' : 'w-full md:w-64'}
              border-r bg-background
              ${isDesktop ? 'relative' : 'fixed inset-0 z-50'}
            `}
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
            <DateNavigator />
            <Button onClick={handleCreateEvent} size="sm">
              <Plus className="mr-2 h-4 w-4" />
              <span className="hidden sm:inline">Create Event</span>
              <span className="sm:hidden">New</span>
            </Button>
          </div>
          <div className="flex items-center gap-4 w-full sm:w-auto">
            <EventSearchFilter />
            <ViewSwitcher />
          </div>
        </header>

        {/* Calendar Content */}
        <main className="flex-1 min-h-0 bg-background p-4 overflow-auto">
          <AnimatePresence mode="wait">
            <motion.div 
              key={`${currentView}-${selectedDate.toISOString()}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {currentView === 'month' && (
                <MonthView />
              )}
              {currentView === 'week' && (
                <WeekView />
              )}
              {currentView === 'agenda' && (
                <AgendaView />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Today's Events Summary */}
        <div className="border-t p-4 bg-muted/10">
          <div className="text-sm text-muted-foreground">
            {events.filter(event => 
              event.startTime.toDateString() === new Date().toDateString()
            ).length} events today
          </div>
        </div>
      </div>

      {/* Event Modal */}
      <EventModal />
    </div>
  );
}