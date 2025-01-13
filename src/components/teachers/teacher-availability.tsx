"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash } from "lucide-react";

interface TimeSlot {
  start: string;
  end: string;
}

interface DayAvailability {
  dayOfWeek: number;
  timeSlots: TimeSlot[];
}

interface TeacherAvailabilityProps {
  value: DayAvailability[];
  onChange: (value: DayAvailability[]) => void;
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

export function TeacherAvailability({ value, onChange }: TeacherAvailabilityProps) {
  const addTimeSlot = (dayIndex: number) => {
    const newValue = [...value];
    newValue[dayIndex].timeSlots.push({ start: "09:00", end: "17:00" });
    onChange(newValue);
  };

  const removeTimeSlot = (dayIndex: number, slotIndex: number) => {
    const newValue = [...value];
    newValue[dayIndex].timeSlots.splice(slotIndex, 1);
    onChange(newValue);
  };

  const updateTimeSlot = (dayIndex: number, slotIndex: number, field: keyof TimeSlot, newTime: string) => {
    const newValue = [...value];
    newValue[dayIndex].timeSlots[slotIndex][field] = newTime;
    onChange(newValue);
  };

  return (
    <div className="space-y-4">
      {DAYS.map((day, dayIndex) => (
        <div key={day} className="space-y-2">
          <Label>{day}</Label>
          {value[dayIndex].timeSlots.map((slot, slotIndex) => (
            <div key={slotIndex} className="flex items-center gap-2">
              <Input
                type="time"
                value={slot.start}
                onChange={(e) => updateTimeSlot(dayIndex, slotIndex, "start", e.target.value)}
              />
              <span>to</span>
              <Input
                type="time"
                value={slot.end}
                onChange={(e) => updateTimeSlot(dayIndex, slotIndex, "end", e.target.value)}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeTimeSlot(dayIndex, slotIndex)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addTimeSlot(dayIndex)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Time Slot
          </Button>
        </div>
      ))}
    </div>
  );
} 