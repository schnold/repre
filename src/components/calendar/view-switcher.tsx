"use client";

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Calendar, ChevronDown } from 'lucide-react';

interface ViewSwitcherProps {
  view: 'day' | 'week' | 'month';
  onViewChange: (view: 'day' | 'week' | 'month') => void;
}

const viewOptions = [
  { value: 'day', label: 'Day View' },
  { value: 'week', label: 'Week View' },
  { value: 'month', label: 'Month View' },
] as const;

export function ViewSwitcher({ view, onViewChange }: ViewSwitcherProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Calendar className="h-4 w-4" />
          {viewOptions.find(v => v.value === view)?.label}
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {viewOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onViewChange(option.value)}
            className="gap-2"
          >
            <Calendar className="h-4 w-4" />
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
} 