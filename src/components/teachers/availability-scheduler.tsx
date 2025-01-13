"use client";

import { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, X } from 'lucide-react';

interface TimeSlot {
  start: string;
  end: string;
}

interface DaySchedule {
  dayOfWeek: number;
  timeSlots: TimeSlot[];
}

interface AvailabilitySchedulerProps {
  value: DaySchedule[];
  onChange: (value: DaySchedule[]) => void;
}

const DAYS = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

export function AvailabilityScheduler({ value, onChange }: AvailabilitySchedulerProps) {
  const [expandedDay, setExpandedDay] = useState<number | null>(null);

  const handleAddTimeSlot = (dayOfWeek: number) => {
    const daySchedule = value.find(d => d.dayOfWeek === dayOfWeek);
    const newTimeSlot = { start: '09:00', end: '17:00' };

    if (daySchedule) {
      onChange(
        value.map(d =>
          d.dayOfWeek === dayOfWeek
            ? { ...d, timeSlots: [...d.timeSlots, newTimeSlot] }
            : d
        )
      );
    } else {
      onChange([
        ...value,
        { dayOfWeek, timeSlots: [newTimeSlot] }
      ]);
    }
  };

  const handleRemoveTimeSlot = (dayOfWeek: number, index: number) => {
    onChange(
      value.map(d =>
        d.dayOfWeek === dayOfWeek
          ? {
              ...d,
              timeSlots: d.timeSlots.filter((_, i) => i !== index)
            }
          : d
      ).filter(d => d.timeSlots.length > 0)
    );
  };

  const handleTimeChange = (
    dayOfWeek: number,
    index: number,
    field: 'start' | 'end',
    time: string
  ) => {
    onChange(
      value.map(d =>
        d.dayOfWeek === dayOfWeek
          ? {
              ...d,
              timeSlots: d.timeSlots.map((slot, i) =>
                i === index
                  ? { ...slot, [field]: time }
                  : slot
              )
            }
          : d
      )
    );
  };

  const getDaySchedule = (dayOfWeek: number) => {
    return value.find(d => d.dayOfWeek === dayOfWeek) || { dayOfWeek, timeSlots: [] };
  };

  return (
    <div className="space-y-4">
      {DAYS.map((day, index) => {
        const dayNumber = index + 1;
        const schedule = getDaySchedule(dayNumber);
        const isExpanded = expandedDay === dayNumber;

        return (
          <Card key={day}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <Button
                    variant="ghost"
                    onClick={() => setExpandedDay(isExpanded ? null : dayNumber)}
                  >
                    {day}
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {schedule.timeSlots.length} time slots
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddTimeSlot(dayNumber)}
                >
                  <Plus className="h-4 w-4" />
                  Add Time Slot
                </Button>
              </div>

              {isExpanded && schedule.timeSlots.length > 0 && (
                <div className="mt-4 space-y-4">
                  {schedule.timeSlots.map((slot, slotIndex) => (
                    <div
                      key={slotIndex}
                      className="flex items-center space-x-4"
                    >
                      <div className="grid grid-cols-2 gap-4 flex-1">
                        <div className="space-y-2">
                          <Label>Start Time</Label>
                          <Input
                            type="time"
                            value={slot.start}
                            onChange={(e) =>
                              handleTimeChange(dayNumber, slotIndex, 'start', e.target.value)
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>End Time</Label>
                          <Input
                            type="time"
                            value={slot.end}
                            onChange={(e) =>
                              handleTimeChange(dayNumber, slotIndex, 'end', e.target.value)
                            }
                          />
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="mt-8"
                        onClick={() => handleRemoveTimeSlot(dayNumber, slotIndex)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
} 