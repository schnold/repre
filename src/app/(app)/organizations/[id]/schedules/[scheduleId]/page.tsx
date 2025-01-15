"use client";

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { ISchedule } from '@/lib/db/interfaces';
import { format } from 'date-fns';
import { CalendarClock, Loader2 } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface WorkingHours {
  start: string;
  end: string;
}

interface ScheduleWithWorkingHours extends Omit<ISchedule, 'workingHours'> {
  workingHours: WorkingHours;
}

interface DateRangePickerProps {
  className?: string;
  from: Date;
  to: Date;
  onSelect: (range: DateRange | undefined) => void;
}

function DateRangePicker({
  className,
  from,
  to,
  onSelect,
}: DateRangePickerProps) {
  const [date, setDate] = useState<DateRange | undefined>({
    from,
    to,
  });

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarClock className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y")} -{" "}
                  {format(date.to, "LLL dd, y")}
                </>
              ) : (
                format(date.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={(newDate) => {
              setDate(newDate);
              onSelect(newDate);
            }}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default async function SchedulePage({
  params: { id: organizationId, id: scheduleId }
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [schedule, setSchedule] = useState<ScheduleWithWorkingHours | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!scheduleId) return;

    const fetchSchedule = async () => {
      try {
        const response = await fetch(`/api/organizations/${organizationId}/schedules/${scheduleId}`);
        if (!response.ok) throw new Error('Failed to fetch schedule');
        const data = await response.json();
        // Convert date strings to Date objects
        data.dateRange = {
          start: new Date(data.dateRange.start),
          end: new Date(data.dateRange.end)
        };
        setSchedule(data);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to fetch schedule details",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSchedule();
  }, [scheduleId, toast]);

  const handleUpdateSchedule = async (updates: Partial<ScheduleWithWorkingHours>) => {
    if (!scheduleId) return;
    setIsSaving(true);
    try {
      // First update the schedule
      const response = await fetch(`/api/schedules/${scheduleId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error('Failed to update schedule');
      
      const updatedSchedule = await response.json();
      // Convert date strings to Date objects
      updatedSchedule.dateRange = {
        start: new Date(updatedSchedule.dateRange.start),
        end: new Date(updatedSchedule.dateRange.end)
      };
      setSchedule(updatedSchedule);

      // If working hours were updated, update all events
      if (updates.workingHours) {
        const eventsResponse = await fetch(`/api/schedules/${scheduleId}/update-events`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            workingHours: updates.workingHours
          }),
        });

        if (!eventsResponse.ok) {
          throw new Error('Failed to update events');
        }
      }
      
      toast({
        title: "Success",
        description: "Schedule updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update schedule",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!organizationId || !scheduleId) return;

    if (!confirm('Are you sure you want to delete this schedule? This will also delete all associated events.')) {
      return;
    }

    try {
      const response = await fetch(`/api/schedules/${scheduleId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete schedule');
      
      toast({
        title: "Success",
        description: "Schedule deleted successfully",
      });
      
      router.push(`/organizations/${organizationId}`);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete schedule",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!schedule) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <p className="text-muted-foreground">Schedule not found</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );
  }

  return (
    <div className="container max-w-5xl py-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Schedule Settings</h1>
        <div className="flex gap-2">
          <Button onClick={() => router.back()} variant="outline">Back</Button>
          <Button onClick={handleDelete} variant="destructive">Delete Schedule</Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>General Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Schedule Name</Label>
            <Input
              id="title"
              value={schedule.name}
              onChange={(e) => handleUpdateSchedule({ name: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Date Range</Label>
            <DateRangePicker
              from={schedule.dateRange.start}
              to={schedule.dateRange.end}
              onSelect={(range: DateRange | undefined) => {
                if (range?.from && range?.to) {
                  handleUpdateSchedule({
                    dateRange: {
                      start: range.from,
                      end: range.to
                    }
                  });
                }
              }}
            />
          </div>

          <div className="space-y-2">
            <Label>Working Hours</Label>
            <div className="flex gap-4">
              <div className="flex-1">
                <Label htmlFor="workStart">Start Time</Label>
                <Input
                  id="workStart"
                  type="time"
                  value={schedule.workingHours.start}
                  onChange={(e) => handleUpdateSchedule({
                    workingHours: {
                      ...schedule.workingHours,
                      start: e.target.value
                    }
                  })}
                />
              </div>
              <div className="flex-1">
                <Label htmlFor="workEnd">End Time</Label>
                <Input
                  id="workEnd"
                  type="time"
                  value={schedule.workingHours.end}
                  onChange={(e) => handleUpdateSchedule({
                    workingHours: {
                      ...schedule.workingHours,
                      end: e.target.value
                    }
                  })}
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Note: Updating working hours will adjust all events in this schedule to fit within the new time range.
            </p>
          </div>
        </CardContent>
      </Card>

      {isSaving && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
          <div className="flex items-center gap-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <p>Updating schedule and events...</p>
          </div>
        </div>
      )}
    </div>
  );
} 