// src/app/(app)/calendar/page.tsx
import { checkAuth } from '@/lib/auth/auth-utils';
import { CalendarProvider } from '@/contexts/calendar-context';
import { CalendarView } from '@/components/calendar/calendar-view';

export default async function CalendarPage() {
  await checkAuth(); // This will redirect if not authenticated

  return (
    <CalendarProvider>
      <div className="h-[calc(100vh-4rem)]">
        <CalendarView />
      </div>
    </CalendarProvider>
  );
}