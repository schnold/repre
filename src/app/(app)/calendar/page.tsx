// src/app/(app)/calendar/page.tsx
import { Suspense } from 'react';
import { checkAuth } from '@/lib/auth/auth-utils';
import { CalendarProvider } from '@/contexts/calendar-context';
import { CalendarView } from '@/components/calendar/calendar-view';
import { CalendarLoading } from '@/components/calendar/calendar-loading';

export default async function CalendarPage() {
  await checkAuth();

  return (
    <Suspense fallback={<CalendarLoading />}>
      <CalendarProvider>
        <div className="h-[calc(100vh-4rem)]">
          <CalendarView />
        </div>
      </CalendarProvider>
    </Suspense>
  );
}