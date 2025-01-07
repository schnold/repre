import React, { useEffect } from 'react';
import { useCalendarStore } from '@/store/calendar-store';
import { CalendarEvent } from '@/lib/types/calendar';
import MonthView from './views/month-view';
import WeekView from './views/week-view';
import AgendaView from './views/agenda-view';
import DateNavigator from './calendar-header/date-navigator';
import ViewSwitcher from './calendar-header/view-switcher';

// Sample test events
const testEvents: CalendarEvent[] = [
  {
    id: '1',
    title: 'Team Meeting',
    startTime: new Date(),
    endTime: new Date(Date.now() + 3600000),
    category: 'work',
    location: 'Conference Room A',
    description: 'Weekly team sync'
  },
  {
    id: '2',
    title: 'Lunch with Client',
    startTime: new Date(Date.now() + 7200000),
    endTime: new Date(Date.now() + 10800000),
    category: 'important',
    location: 'Downtown Cafe',
    description: 'Project discussion over lunch'
  },
  {
    id: '3',
    title: 'Gym Session',
    startTime: new Date(Date.now() + 43200000),
    endTime: new Date(Date.now() + 46800000),
    category: 'personal',
    location: 'Fitness Center',
    description: 'Weekly workout routine'
  }
];

const RepreApp: React.FC = () => {
  const { currentView, addEvent } = useCalendarStore();

  // Initialize test events
  useEffect(() => {
    testEvents.forEach(event => addEvent(event));
  }, [addEvent]);

  // Render appropriate view based on currentView state
  const renderView = () => {
    switch (currentView) {
      case 'month':
        return <MonthView />;
      case 'week':
        return <WeekView />;
      case 'agenda':
        return <AgendaView />;
      default:
        return <MonthView />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Calendar Header */}
      <header className="flex items-center justify-between p-4 border-b">
        <DateNavigator />
        <ViewSwitcher />
      </header>

      {/* Calendar Content */}
      <main className="flex-1 overflow-hidden">
        {renderView()}
      </main>
    </div>
  );
};

export default RepreApp;