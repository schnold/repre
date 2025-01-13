'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WorkingHours {
  start: string;
  end: string;
}

interface Break {
  name: string;
  startTime: string;
  endTime: string;
  days: number[];
}

interface TimeGridProps {
  workingDays: number[];
  defaultWorkingHours: WorkingHours;
  breaks: Break[];
  onWorkingDaysChange: (days: number[]) => void;
  onWorkingHoursChange: (hours: WorkingHours) => void;
  onBreaksChange: (breaks: Break[]) => void;
}

const DAYS = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
];

export function TimeGrid({
  workingDays,
  defaultWorkingHours,
  breaks,
  onWorkingDaysChange,
  onWorkingHoursChange,
  onBreaksChange,
}: TimeGridProps) {
  const toggleDay = (day: number) => {
    if (workingDays.includes(day)) {
      onWorkingDaysChange(workingDays.filter(d => d !== day));
    } else {
      onWorkingDaysChange([...workingDays, day].sort());
    }
  };

  const addBreak = () => {
    onBreaksChange([
      ...breaks,
      {
        name: 'New Break',
        startTime: '10:00',
        endTime: '10:30',
        days: [...workingDays],
      },
    ]);
  };

  const updateBreak = (index: number, field: keyof Break, value: string | number[]) => {
    const updatedBreaks = breaks.map((b, i) =>
      i === index ? { ...b, [field]: value } : b
    );
    onBreaksChange(updatedBreaks);
  };

  const removeBreak = (index: number) => {
    onBreaksChange(breaks.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <Label>Working Days</Label>
        <div className="flex gap-2">
          {DAYS.map((day) => (
            <button
              key={day.value}
              type="button"
              onClick={() => toggleDay(day.value)}
              className={cn(
                "px-3 py-1 rounded-md text-sm font-medium transition-colors",
                workingDays.includes(day.value)
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary hover:bg-secondary/80"
              )}
            >
              {day.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <Label>Default Working Hours</Label>
        <div className="flex items-center gap-4">
          <div className="grid gap-2">
            <Label>Start Time</Label>
            <Input
              type="time"
              value={defaultWorkingHours.start}
              onChange={(e) =>
                onWorkingHoursChange({
                  ...defaultWorkingHours,
                  start: e.target.value,
                })
              }
            />
          </div>
          <div className="grid gap-2">
            <Label>End Time</Label>
            <Input
              type="time"
              value={defaultWorkingHours.end}
              onChange={(e) =>
                onWorkingHoursChange({
                  ...defaultWorkingHours,
                  end: e.target.value,
                })
              }
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label>Breaks</Label>
          <Button type="button" variant="outline" size="sm" onClick={addBreak}>
            <Plus className="w-4 h-4 mr-2" />
            Add Break
          </Button>
        </div>

        <div className="space-y-4">
          {breaks.map((breakItem, index) => (
            <div
              key={index}
              className="flex items-start gap-4 p-4 border rounded-lg"
            >
              <div className="flex-1 space-y-4">
                <Input
                  placeholder="Break name"
                  value={breakItem.name}
                  onChange={(e) => updateBreak(index, 'name', e.target.value)}
                />
                <div className="flex gap-4">
                  <div className="grid gap-2">
                    <Label>Start Time</Label>
                    <Input
                      type="time"
                      value={breakItem.startTime}
                      onChange={(e) =>
                        updateBreak(index, 'startTime', e.target.value)
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label>End Time</Label>
                    <Input
                      type="time"
                      value={breakItem.endTime}
                      onChange={(e) =>
                        updateBreak(index, 'endTime', e.target.value)
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Days</Label>
                  <div className="flex gap-2">
                    {DAYS.map((day) => (
                      <button
                        key={day.value}
                        type="button"
                        onClick={() => {
                          const days = breakItem.days.includes(day.value)
                            ? breakItem.days.filter(d => d !== day.value)
                            : [...breakItem.days, day.value].sort();
                          updateBreak(index, 'days', days);
                        }}
                        className={cn(
                          "px-2 py-1 rounded-md text-xs font-medium transition-colors",
                          breakItem.days.includes(day.value)
                            ? "bg-primary text-primary-foreground"
                            : "bg-secondary hover:bg-secondary/80"
                        )}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeBreak(index)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 