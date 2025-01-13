// src/components/calendar/calendar-header/view-switcher.tsx
'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Calendar, Grid3X3, List, Menu } from "lucide-react";

interface ViewSwitcherProps {
  view: 'day' | 'week' | 'month' | 'agenda';
  onViewChange: (view: 'day' | 'week' | 'month' | 'agenda') => void;
}

const ViewSwitcher = ({ view, onViewChange }: ViewSwitcherProps) => {
  const viewIcons = {
    day: <Grid3X3 className="h-4 w-4" />,
    week: <Calendar className="h-4 w-4" />,
    month: <Calendar className="h-4 w-4" />,
    agenda: <List className="h-4 w-4" />
  };

  const viewLabels = {
    day: 'Day View',
    week: 'Week View',
    month: 'Month View',
    agenda: 'Agenda View'
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-2">
          {viewIcons[view]}
          <span className="hidden sm:inline">{viewLabels[view]}</span>
          <Menu className="h-4 w-4 sm:hidden" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onViewChange('day')}>
          <Grid3X3 className="mr-2 h-4 w-4" />
          <span>Day View</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onViewChange('week')}>
          <Calendar className="mr-2 h-4 w-4" />
          <span>Week View</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onViewChange('month')}>
          <Calendar className="mr-2 h-4 w-4" />
          <span>Month View</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onViewChange('agenda')}>
          <List className="mr-2 h-4 w-4" />
          <span>Agenda View</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ViewSwitcher;