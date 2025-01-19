"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EventForm } from "./event-form";
import { useToast } from "@/components/ui/use-toast";
import { IEvent } from "@/lib/db/interfaces";

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  scheduleId: string;
  onSuccess?: () => void;
  event?: IEvent;
  defaultRecurring?: boolean;
}

export function EventModal({ 
  isOpen, 
  onClose, 
  scheduleId,
  onSuccess,
  event,
  defaultRecurring = false
}: EventModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {
      const url = event 
        ? `/api/events/${event._id}` 
        : `/api/events`;
      const method = event ? "PATCH" : "POST";

      // Convert string dates back to Date objects for the API
      const apiData = {
        ...data,
        scheduleId,
        recurrence: data.recurrence ? {
          ...data.recurrence,
          endsOn: data.recurrence.endsOn ? new Date(data.recurrence.endsOn) : undefined,
        } : undefined
      };

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Response error:', response.status, errorData);
        throw new Error(errorData?.error || (event ? "Failed to update event" : "Failed to create event"));
      }

      toast({
        title: "Success",
        description: `Event ${event ? 'updated' : 'created'} successfully`,
      });
      onClose();
      onSuccess?.();
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : (event ? "Failed to update event" : "Failed to create event"),
      });
    } finally {
      setLoading(false);
    }
  };

  const formatRecurrence = (recurrence: IEvent['recurrence']) => {
    if (!recurrence) return undefined;
    return {
      frequency: recurrence.frequency,
      interval: recurrence.interval,
      daysOfWeek: recurrence.daysOfWeek,
      endsOn: recurrence.endsOn ? new Date(recurrence.endsOn).toISOString().split('T')[0] : undefined,
      count: recurrence.count,
    };
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{event ? 'Edit Event' : 'Create New Event'}</DialogTitle>
        </DialogHeader>
        <EventForm 
          onSubmit={handleSubmit} 
          scheduleId={scheduleId}
          initialData={event ? {
            title: event.title,
            description: event.description || "",
            teacherId: event.teacherId.toString(),
            startTime: new Date(event.startTime).toISOString().slice(0, 16),
            endTime: new Date(event.endTime).toISOString().slice(0, 16),
            isRecurring: event.isRecurring,
            recurrence: formatRecurrence(event.recurrence)
          } : {
            title: "",
            description: "",
            teacherId: "",
            startTime: new Date().toISOString().slice(0, 16),
            endTime: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
            isRecurring: defaultRecurring,
            recurrence: defaultRecurring ? {
              frequency: "weekly",
              interval: 1,
              daysOfWeek: []
            } : undefined
          }}
          isLoading={loading}
        />
      </DialogContent>
    </Dialog>
  );
}