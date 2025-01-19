'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { IEvent } from '@/lib/db/interfaces';
import { useToast } from '@/components/ui/use-toast';
import { EventForm } from './event-form';

interface EventDialogProps {
  event: Partial<IEvent> | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Partial<IEvent>) => void;
  scheduleId: string;
}

export function EventDialog({ event, isOpen, onClose, onSave, scheduleId }: EventDialogProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {
      await onSave({
        ...event,
        ...data,
        startTime: new Date(data.startTime),
        endTime: new Date(data.endTime),
      });
      onClose();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save event"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{event?._id ? 'Edit Event' : 'Create Event'}</DialogTitle>
        </DialogHeader>
        <EventForm 
          onSubmit={handleSubmit}
          scheduleId={scheduleId}
          initialData={event ? {
            title: event.title || "",
            description: event.description || "",
            teacherId: event.teacherId?.toString() || "",
            startTime: event.startTime ? new Date(event.startTime).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
            endTime: event.endTime ? new Date(event.endTime).toISOString().slice(0, 16) : new Date(Date.now() + 3600000).toISOString().slice(0, 16),
            isRecurring: false
          } : {
            title: "",
            description: "",
            teacherId: "",
            startTime: new Date().toISOString().slice(0, 16),
            endTime: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
            isRecurring: false
          }}
          isLoading={loading}
        />
      </DialogContent>
    </Dialog>
  );
} 