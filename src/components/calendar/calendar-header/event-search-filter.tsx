'use client'

import React from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useCalendarStore } from '@/store/calendar-store';

export default function EventSearchFilter() {
  const { searchQuery, setSearchQuery } = useCalendarStore();

  return (
    <div className="relative w-full sm:w-64">
      <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Search events..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-8"
      />
    </div>
  );
}