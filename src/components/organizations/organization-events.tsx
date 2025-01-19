"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Trash2, Calendar, Clock } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IEvent, ISchedule, ITeacher } from "@/lib/db/interfaces";
import { format } from "date-fns";
import { EventModal } from "@/components/calendar/events/event-modal";

interface OrganizationEventsProps {
  organizationId: string;
}

interface IEventWithStringId {
  _id: string;
  title: string;
  description?: string;
  date: string;
  startTime: string;
  endTime: string;
  teacherId: string;
  scheduleId: string;
  isRecurring: boolean;
  recurrence?: {
    frequency: "daily" | "weekly" | "monthly";
    interval: number;
    daysOfWeek?: number[];
    endsOn?: string;
    count?: number;
  };
}

export function OrganizationEvents({ organizationId }: OrganizationEventsProps) {
  const { toast } = useToast();
  const [events, setEvents] = useState<IEventWithStringId[]>([]);
  const [schedules, setSchedules] = useState<ISchedule[]>([]);
  const [teachers, setTeachers] = useState<ITeacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSchedule, setSelectedSchedule] = useState<string>("");
  const [newEventData, setNewEventData] = useState({
    title: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    teacherId: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);

  useEffect(() => {
    Promise.all([
      fetchEvents(),
      fetchSchedules(),
      fetchTeachers(),
    ]).finally(() => setLoading(false));
  }, [organizationId]);

  const fetchEvents = async () => {
    try {
      if (!selectedSchedule) return;
      const response = await fetch(
        `/api/schedules/${selectedSchedule}/events`
      );
      if (response.ok) {
        const data = await response.json();
        const formattedEvents = data.map((event: IEvent) => ({
          ...event,
          _id: event._id.toString(),
          teacherId: event.teacherId.toString(),
        }));
        setEvents(formattedEvents);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const fetchSchedules = async () => {
    try {
      const response = await fetch(
        `/api/organizations/${organizationId}/schedules`
      );
      if (response.ok) {
        const data = await response.json();
        setSchedules(data);
        if (data.length > 0) {
          setSelectedSchedule(data[0]._id.toString());
        }
      }
    } catch (error) {
      console.error("Error fetching schedules:", error);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await fetch(
        `/api/organizations/${organizationId}/teachers`
      );
      if (!response.ok) throw new Error("Failed to fetch teachers");
      const data = await response.json();
      setTeachers(data);
    } catch (error) {
      console.error("Error fetching teachers:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load teachers. Please try again later."
      });
    }
  };

  useEffect(() => {
    if (selectedSchedule) {
      fetchEvents();
    }
  }, [selectedSchedule]);

  const handleCreateEvent = async () => {
    try {
      const response = await fetch(
        `/api/admin/organizations/${organizationId}/schedules/${selectedSchedule}/events`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newEventData),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to create event");
      }

      toast({
        title: "Success",
        description: "Event created successfully",
      });

      setNewEventData({
        title: "",
        description: "",
        date: "",
        startTime: "",
        endTime: "",
        teacherId: "",
      });
      fetchEvents();
    } catch (error) {
      console.error("Error creating event:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create event",
      });
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      const response = await fetch(
        `/api/admin/organizations/${organizationId}/schedules/${selectedSchedule}/events/${eventId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete event");
      }

      toast({
        title: "Success",
        description: "Event deleted successfully",
      });

      fetchEvents();
    } catch (error) {
      console.error("Error deleting event:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete event",
      });
    }
  };

  if (loading) {
    return <div>Loading events...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <Select
          value={selectedSchedule}
          onValueChange={(value) => setSelectedSchedule(value)}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select Schedule" />
          </SelectTrigger>
          <SelectContent>
            {schedules.map((schedule) => (
              <SelectItem key={schedule._id.toString()} value={schedule._id.toString()}>
                {schedule.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Button 
            disabled={!selectedSchedule} 
            variant="outline"
            onClick={() => {
              setIsRecurring(false);
              setIsModalOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Event
          </Button>
          <Button 
            disabled={!selectedSchedule}
            onClick={() => {
              setIsRecurring(true);
              setIsModalOpen(true);
            }}
          >
            <Calendar className="mr-2 h-4 w-4" />
            New Recurring Event
          </Button>
        </div>
      </div>

      {selectedSchedule && isModalOpen && (
        <EventModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          scheduleId={selectedSchedule}
          onSuccess={() => {
            fetchEvents();
            setIsModalOpen(false);
          }}
          defaultRecurring={isRecurring}
        />
      )}

      <div className="grid gap-4">
        {events.map((event) => (
          <Card key={event._id}>
            <CardContent className="flex justify-between items-center p-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  {event.isRecurring ? (
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  )}
                  <h3 className="font-medium">{event.title}</h3>
                </div>
                {event.description && (
                  <p className="text-sm text-muted-foreground">
                    {event.description}
                  </p>
                )}
                <div className="text-sm text-muted-foreground">
                  {format(new Date(event.date), "PP")}
                  {" • "}
                  {event.startTime} - {event.endTime}
                </div>
                <div className="text-sm text-muted-foreground">
                  Teacher:{" "}
                  {teachers.find((t) => t._id.toString() === event.teacherId)?.name}
                </div>
                {event.isRecurring && event.recurrence && (
                  <div className="text-sm text-muted-foreground">
                    Repeats: {event.recurrence.frequency}
                    {event.recurrence.interval > 1 && ` (every ${event.recurrence.interval} ${event.recurrence.frequency}s)`}
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleDeleteEvent(event._id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 