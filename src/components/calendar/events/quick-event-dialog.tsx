'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { IEvent } from '@/lib/db/interfaces';
import { useToast } from '@/components/ui/use-toast';
import { EventForm } from './event-form';

interface QuickEventDialogProps {
  event: Partial<IEvent> | null;
  isOpen: boolean;
  position: { x: number; y: number } | null;
  onClose: () => void;
  onSave: (event: Partial<IEvent>) => void;
  scheduleId: string;
}

export function QuickEventDialog({ 
  event, 
  isOpen, 
  position, 
  onClose, 
  onSave,
  scheduleId 
}: QuickEventDialogProps) {
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
      <DialogContent
        style={{
          position: 'fixed',
          top: position?.y,
          left: position?.x,
          transform: 'translate(-50%, -50%)',
          maxWidth: '600px'
        }}
        className="max-h-[90vh] overflow-y-auto"
      >
        <EventForm 
          onSubmit={handleSubmit}
          scheduleId={scheduleId}
          initialData={{
            title: "",
            description: "",
            teacherId: "",
            startTime: event?.startTime ? new Date(event.startTime).toISOString().slice(0, 16) : new Date().toISOString().slice(0, 16),
            endTime: event?.endTime ? new Date(event.endTime).toISOString().slice(0, 16) : new Date(Date.now() + 3600000).toISOString().slice(0, 16),
            isRecurring: false
          }}
          isLoading={loading}
        />
      </DialogContent>
    </Dialog>
  );
} 