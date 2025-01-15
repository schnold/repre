// src/components/calendar/events/event-creator.tsx
import React, { useState, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCalendarStore } from '@/store/calendar-store';
import { useTeacherStore } from '@/store/teacher-store';
import { CalendarEvent } from '@/lib/types/calendar';
import { format } from 'date-fns';
import { useSchedule } from '@/hooks/use-schedule';

interface EventCreatorProps {
  isOpen: boolean;
  onClose: () => void;
  initialDate?: Date;
}

interface EventFormData {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  subjectId?: string;
  teacherId?: string;
  color?: string;
}

const DEFAULT_DURATION = 60; // minutes

const EventCreator: React.FC<EventCreatorProps> = ({
  isOpen,
  onClose,
  initialDate,
}) => {
  const { addEvent, subjects } = useCalendarStore();
  const { teachers } = useTeacherStore();

  // Initialize form data
  const getInitialFormData = useCallback((): EventFormData => {
    const startDate = initialDate || new Date();
    const endDate = new Date(startDate.getTime() + DEFAULT_DURATION * 60000);

    return {
      title: '',
      description: '',
      startTime: format(startDate, "yyyy-MM-dd'T'HH:mm"),
      endTime: format(endDate, "yyyy-MM-dd'T'HH:mm"),
      location: '',
      subjectId: undefined,
      teacherId: undefined,
      color: undefined,
    };
  }, [initialDate]);

  const [formData, setFormData] = useState<EventFormData>(getInitialFormData());
  const [errors, setErrors] = useState<Partial<EventFormData>>({});

  // Reset form when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setFormData(getInitialFormData());
      setErrors({});
    }
  }, [isOpen, getInitialFormData]);

  const validateForm = (): boolean => {
    const newErrors: Partial<EventFormData> = {};
    let isValid = true;

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
      isValid = false;
    }

    const startDate = new Date(formData.startTime);
    const endDate = new Date(formData.endTime);

    if (startDate >= endDate) {
      newErrors.endTime = 'End time must be after start time';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const subject = subjects.find(s => s.id === formData.subjectId);
    const teacher = teachers.find(t => t.id === formData.teacherId);

    const newEvent: Omit<CalendarEvent, 'id'> = {
      title: formData.title,
      description: formData.description,
      startTime: new Date(formData.startTime),
      endTime: new Date(formData.endTime),
      room: formData.location,
      category: 'work',
      color: formData.color || subject?.color || teacher?.color,
      scheduleId: useSchedule()?.selectedSchedule?._id || '',
      status: 'active' as const,
      createdBy: '', // This should come from auth
      createdAt: new Date(),
      updatedAt: new Date()
    };

    addEvent(newEvent);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Event title"
              className={errors.title ? 'border-red-500' : ''}
            />
            {errors.title && (
              <span className="text-xs text-red-500">{errors.title}</span>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Event description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className={errors.endTime ? 'border-red-500' : ''}
              />
              {errors.endTime && (
                <span className="text-xs text-red-500">{errors.endTime}</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Event location"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Subject</Label>
              <Select
                value={formData.subjectId}
                onValueChange={(value) => setFormData({ ...formData, subjectId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Subjects</SelectLabel>
                    {subjects.map((subject) => (
                      <SelectItem 
                        key={subject.id} 
                        value={subject.id}
                        className="flex items-center gap-2"
                      >
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: subject.color }}
                        />
                        {subject.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Teacher</Label>
              <Select
                value={formData.teacherId}
                onValueChange={(value) => setFormData({ ...formData, teacherId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select teacher" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Teachers</SelectLabel>
                    {teachers.map((teacher) => (
                      <SelectItem 
                        key={teacher.id} 
                        value={teacher.id}
                        className="flex items-center gap-2"
                      >
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: teacher.color }}
                        />
                        {teacher.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          {!formData.subjectId && !formData.teacherId && (
            <div className="space-y-2">
              <Label htmlFor="color">Color</Label>
              <Input
                type="color"
                id="color"
                value={formData.color || '#BFD5FF'}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              />
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Create Event</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EventCreator;