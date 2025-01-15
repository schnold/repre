"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOrganization } from "@/hooks/use-organization";
import { useSchedule } from "@/hooks/use-schedule";
import { CalendarDays } from "lucide-react";
import { ISchedule } from "@/lib/db/interfaces";

export function ScheduleSelector() {
  const { selectedOrganization } = useOrganization();
  const { selectedSchedule, setSelectedSchedule } = useSchedule();
  const [schedules, setSchedules] = useState<(ISchedule & { _id: string })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedOrganization?._id) {
      fetchSchedules();
    }
  }, [selectedOrganization?._id]);

  const fetchSchedules = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/organizations/${selectedOrganization?._id}/schedules`);
      if (!response.ok) {
        throw new Error('Failed to fetch schedules');
      }
      const data = await response.json();
      setSchedules(data);

      // If no schedule is selected and we have schedules, select the first active one
      if (!selectedSchedule && data.length > 0) {
        const activeSchedule = data.find((s: ISchedule & { _id: string }) => s.status === 'active') || data[0];
        setSelectedSchedule(activeSchedule);
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleChange = (scheduleId: string) => {
    const schedule = schedules.find(s => s._id === scheduleId);
    if (schedule) {
      setSelectedSchedule(schedule);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <CalendarDays className="h-4 w-4 text-muted-foreground animate-pulse" />
        <div className="h-9 w-[200px] rounded-md border border-input bg-background animate-pulse" />
      </div>
    );
  }

  if (!schedules.length) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <CalendarDays className="h-4 w-4" />
        <span>No schedules available</span>
      </div>
    );
  }

  return (
    <Select
      value={selectedSchedule?._id}
      onValueChange={handleScheduleChange}
    >
      <SelectTrigger className="w-[200px]">
        <CalendarDays className="mr-2 h-4 w-4 text-muted-foreground" />
        <SelectValue placeholder="Select schedule" />
      </SelectTrigger>
      <SelectContent>
        {schedules.map((schedule) => (
          <SelectItem 
            key={schedule._id} 
            value={schedule._id}
            className="flex items-center gap-2"
          >
            <span>{schedule.name}</span>
            {schedule.status !== 'active' && (
              <span className="text-xs text-muted-foreground">({schedule.status})</span>
            )}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
} 