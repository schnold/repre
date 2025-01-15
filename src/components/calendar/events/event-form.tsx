"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCalendarStore } from '@/store/calendar-store';
import { useSchedule } from '@/hooks/use-schedule';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X } from 'lucide-react';

export interface EventFormProps {
  onClose: () => void;
}

export function EventForm({ onClose }: EventFormProps) {
  const router = useRouter();
  const { selectedSchedule } = useSchedule();
  const { modalMode, selectedEvent } = useCalendarStore();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: selectedEvent?.title || '',
    description: selectedEvent?.description || '',
    room: selectedEvent?.room || '',
    startTime: selectedEvent?.startTime || new Date(),
    endTime: selectedEvent?.endTime || new Date(),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSchedule?._id) return;

    setLoading(true);
    try {
      const endpoint = modalMode === 'create' 
        ? '/api/events'
        : `/api/events/${selectedEvent?._id}`;
      
      const method = modalMode === 'create' ? 'POST' : 'PUT';
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          scheduleId: selectedSchedule._id,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save event');
      }

      toast({
        title: `Event ${modalMode === 'create' ? 'Created' : 'Updated'}`,
        description: `Successfully ${modalMode === 'create' ? 'created' : 'updated'} "${formData.title}"`,
      });

      onClose();
      router.refresh();
    } catch (error) {
      console.error('Error saving event:', error);
      toast({
        title: "Error",
        description: `Failed to ${modalMode === 'create' ? 'create' : 'update'} event`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {modalMode === 'create' ? 'Create Event' : 'Edit Event'}
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              placeholder="Event Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div>
            <Textarea
              placeholder="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div>
            <Input
              placeholder="Room"
              value={formData.room}
              onChange={(e) => setFormData({ ...formData, room: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Calendar
                mode="single"
                selected={formData.startTime}
                onSelect={(date) => date && setFormData({ ...formData, startTime: date })}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </div>
            <div>
              <Calendar
                mode="single"
                selected={formData.endTime}
                onSelect={(date) => date && setFormData({ ...formData, endTime: date })}
                disabled={(date) => date < formData.startTime}
                initialFocus
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : modalMode === 'create' ? 'Create' : 'Update'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 