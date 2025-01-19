"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ISchedule } from "@/lib/db/interfaces";

interface ScheduleSelectorProps {
  onScheduleSelect: (scheduleId: string) => void;
  organizationId: string;
}

export function ScheduleSelector({ onScheduleSelect, organizationId }: ScheduleSelectorProps) {
  const [schedules, setSchedules] = useState<Array<ISchedule>>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await fetch(`/api/organizations/${organizationId}/schedules`);
        if (!response.ok) throw new Error("Failed to fetch schedules");
        const data = await response.json();
        setSchedules(data);
      } catch (error) {
        setError("Failed to load schedules. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [organizationId]);

  if (loading) {
    return <div>Loading schedules...</div>;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="w-full max-w-sm">
      <Select onValueChange={onScheduleSelect}>
        <SelectTrigger>
          <SelectValue placeholder="Select a schedule" />
        </SelectTrigger>
        <SelectContent>
          {schedules.map((schedule) => (
            <SelectItem 
              key={schedule._id.toString()} 
              value={schedule._id.toString()}
            >
              {schedule.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
} 