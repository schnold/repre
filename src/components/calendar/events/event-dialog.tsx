'use client';

import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { IEvent } from '@/lib/db/schema/event';
import { useForm } from 'react-hook-form';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';

interface EventDialogProps {
  event: Partial<IEvent> | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Partial<IEvent>) => void;
}

interface EventFormData {
  title: string;
  description?: string;
  room?: string;
  startTime: string;
  endTime: string;
}

export function EventDialog({ event, isOpen, onClose, onSave }: EventDialogProps) {
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors } } = useForm<EventFormData>({
    defaultValues: {
      title: event?.title || '',
      description: event?.description || '',
      room: event?.room || '',
      startTime: event?.startTime ? format(new Date(event.startTime), "yyyy-MM-dd'T'HH:mm") : format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      endTime: event?.endTime ? format(new Date(event.endTime), "yyyy-MM-dd'T'HH:mm") : format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    }
  });

  const onSubmit = async (data: EventFormData) => {
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
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{event?._id ? 'Edit Event' : 'Create Event'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              {...register('title', { required: 'Title is required' })}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              {...register('description')}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="room">Room</Label>
            <Input
              id="room"
              {...register('room')}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="datetime-local"
                {...register('startTime', { required: 'Start time is required' })}
              />
              {errors.startTime && (
                <p className="text-sm text-destructive">{errors.startTime.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="datetime-local"
                {...register('endTime', { required: 'End time is required' })}
              />
              {errors.endTime && (
                <p className="text-sm text-destructive">{errors.endTime.message}</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              {event?._id ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 