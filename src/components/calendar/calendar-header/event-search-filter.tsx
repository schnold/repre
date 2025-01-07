'use client'

import React from 'react';
import { Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useCalendarStore } from '@/store/calendar-store';
import { EventCategory } from '@/lib/types/calendar';

const EventSearchFilter: React.FC = () => {
  const { filters, setFilters, clearFilters } = useCalendarStore();

  const handleCategoryToggle = (category: EventCategory) => {
    const currentCategories = filters.categories;
    const newCategories = currentCategories.includes(category)
      ? currentCategories.filter(c => c !== category)
      : [...currentCategories, category];
    
    setFilters({ categories: newCategories });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ searchQuery: e.target.value });
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search events..."
          value={filters.searchQuery}
          onChange={handleSearchChange}
          className="pl-8"
        />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem
            checked={filters.categories.includes('work')}
            onCheckedChange={() => handleCategoryToggle('work')}
          >
            Work
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={filters.categories.includes('personal')}
            onCheckedChange={() => handleCategoryToggle('personal')}
          >
            Personal
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={filters.categories.includes('important')}
            onCheckedChange={() => handleCategoryToggle('important')}
          >
            Important
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={filters.categories.includes('other')}
            onCheckedChange={() => handleCategoryToggle('other')}
          >
            Other
          </DropdownMenuCheckboxItem>
          <DropdownMenuSeparator />
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center"
            onClick={clearFilters}
          >
            Clear Filters
          </Button>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default EventSearchFilter;