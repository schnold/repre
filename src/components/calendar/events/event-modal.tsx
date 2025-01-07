'use client'

import React, { useEffect, useState } from 'react';
import { EventCategory } from '@/lib/types/calendar';
import { useCalendarStore } from '@/store/calendar-store';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useTeacherStore } from '@/store/teacher-store';

interface EventFormData {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  category: EventCategory;
  teacherId?: string;
  substituteTeacherId?:string
  color?: string;
}

const EventModal: React.FC = () => {
  const { 
    isEventModalOpen, 
    setEventModalOpen, 
    modalMode, 
    selectedEventId, 
    events, 
    addEvent, 
    updateEvent 
  } = useCalendarStore();

  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    color: "#BFD5FF",
    startTime: new Date().toISOString().slice(0, 16),
    endTime: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
    location: '',
    category: 'other'
  });

  const [errors, setErrors] = useState<Partial<EventFormData>>({});

  useEffect(() => {
    if (selectedEventId && modalMode === 'edit') {
      const event = events.find(e => e.id === selectedEventId);
      if (event) {
        setFormData({
          title: event.title,
          description: event.description || '',
          startTime: event.startTime.toISOString().slice(0, 16),
          endTime: event.endTime.toISOString().slice(0, 16),
          location: event.location || '',
          category: event.category
        });
      }
    } else {
      // Reset form for new event
      setFormData({
        title: '',
        description: '',
        startTime: new Date().toISOString().slice(0, 16),
        endTime: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
        location: '',
        category: 'other'
      });
    }
  }, [selectedEventId, modalMode, events]);

  const validateForm = (): boolean => {
    const newErrors: Partial<EventFormData> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (new Date(formData.startTime) >= new Date(formData.endTime)) {
      newErrors.endTime = 'End time must be after start time';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    const eventData = {
      title: formData.title,
      description: formData.description,
      startTime: new Date(formData.startTime),
      endTime: new Date(formData.endTime),
      location: formData.location,
      category: formData.category
    };

    if (modalMode === 'edit' && selectedEventId) {
      updateEvent(selectedEventId, eventData);
    } else {
      addEvent(eventData);
    }

    setEventModalOpen(false);
  };


  const { teachers } = useTeacherStore(); // retrieve list of teachers


  return (
    <Dialog open={isEventModalOpen} onOpenChange={setEventModalOpen}>
      <DialogContent className="sm:max-w-[475px]">
        <DialogHeader>
          <DialogTitle>
            {modalMode === 'edit' ? 'Edit Event' : 'Create New Event'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <div className="relative">
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className={cn(errors.title && "border-red-500 focus-visible:ring-red-500")}
                placeholder="Event title"
              />
              {errors.title && (
                <span className="text-xs text-red-500 mt-1">{errors.title}</span>
              )}
            </div>
          </div>

          <div className="space-y-2">
          <Label htmlFor="color">Event Color</Label>
          <Input
            type="color"
            id="color"
            value={formData.color}
            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
          />
        </div>

          <div className="space-y-2">
            <Label htmlFor="teacher">Teacher</Label>
            <Select
              // formData.teacherId will now exist
              value={formData.teacherId || ''}
              // Update the formData when a teacher is selected
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, teacherId: value }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a Teacher" />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((teacher) => (
                  // Fix the implicit "any" by defining the 'Teacher' interface
                  <SelectItem key={teacher.id} value={teacher.id}>
                    {teacher.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Label htmlFor="substitute">Substitute Teacher</Label>
          <Select
            value={formData.substituteTeacherId || ""}
            onValueChange={(value) => setFormData({ ...formData, substituteTeacherId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="(Optional) Substitute Teacher" />
            </SelectTrigger>
            <SelectContent>
              {teachers.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

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
              <div className="relative">
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className={cn(errors.endTime && "border-red-500 focus-visible:ring-red-500")}
                />
                {errors.endTime && (
                  <span className="text-xs text-red-500 mt-1">{errors.endTime}</span>
                )}
              </div>
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

          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category}
              onValueChange={(value: EventCategory) => 
                setFormData({ ...formData, category: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="work">Work</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
                <SelectItem value="important">Important</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
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

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEventModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {modalMode === 'edit' ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EventModal;