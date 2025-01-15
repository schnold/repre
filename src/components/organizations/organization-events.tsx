"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Trash2, Calendar } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IEvent, ISchedule, ITeacher } from "@/lib/db/interfaces";
import { format } from "date-fns";

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
        `/api/admin/organizations/${organizationId}/schedules/${selectedSchedule}/events`
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
        `/api/admin/organizations/${organizationId}/schedules`
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
        `/api/admin/organizations/${organizationId}/teachers`
      );
      if (response.ok) {
        const data = await response.json();
        setTeachers(data);
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
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

        <Dialog>
          <DialogTrigger asChild>
            <Button disabled={!selectedSchedule}>
              <Plus className="mr-2 h-4 w-4" />
              New Event
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Event</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={newEventData.title}
                  onChange={(e) =>
                    setNewEventData({
                      ...newEventData,
                      title: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newEventData.description}
                  onChange={(e) =>
                    setNewEventData({
                      ...newEventData,
                      description: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={newEventData.date}
                  onChange={(e) =>
                    setNewEventData({
                      ...newEventData,
                      date: e.target.value,
                    })
                  }
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={newEventData.startTime}
                    onChange={(e) =>
                      setNewEventData({
                        ...newEventData,
                        startTime: e.target.value,
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={newEventData.endTime}
                    onChange={(e) =>
                      setNewEventData({
                        ...newEventData,
                        endTime: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="teacher">Teacher</Label>
                <Select
                  value={newEventData.teacherId}
                  onValueChange={(value) =>
                    setNewEventData({
                      ...newEventData,
                      teacherId: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem
                        key={teacher._id.toString()}
                        value={teacher._id.toString()}
                      >
                        {teacher.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleCreateEvent}>Create Event</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {events.map((event) => (
          <Card key={event._id}>
            <CardContent className="flex justify-between items-center p-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
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