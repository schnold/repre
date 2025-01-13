'use client';

import React from 'react';
import { format } from 'date-fns';
import { IEvent, ITeacher, ISubject } from '@/lib/db/schemas';
import { Types } from 'mongoose';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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

interface EventDialogProps {
  event: Partial<IEvent> | null;
  teachers: ITeacher[];
  subjects: ISubject[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (event: Partial<IEvent>) => void;
  onDelete?: (event: IEvent) => void;
}

export function EventDialog({
  event,
  teachers = [],
  subjects = [],
  isOpen,
  onClose,
  onSave,
  onDelete
}: EventDialogProps) {
  const [selectedSubject, setSelectedSubject] = React.useState<ISubject | undefined>(
    event?.subject ? subjects.find(s => s.name === event.subject) : undefined
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const startDate = formData.get('startDate') as string;
    const startTime = formData.get('startTime') as string;
    const endDate = formData.get('endDate') as string;
    const endTime = formData.get('endTime') as string;

    const startDateTime = new Date(`${startDate}T${startTime}`);
    const endDateTime = new Date(`${endDate}T${endTime}`);

    const updatedEvent: Partial<IEvent> = {
      ...event,
      title: formData.get('title') as string,
      subject: formData.get('subject') as string,
      teacherId: new Types.ObjectId(formData.get('teacherId') as string),
      startTime: startDateTime,
      endTime: endDateTime,
      location: formData.get('location') as string,
      status: event?.status || 'scheduled'
    };

    onSave(updatedEvent);
  };

  const isNewEvent = !event?._id;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{isNewEvent ? 'Create Event' : 'Edit Event'}</DialogTitle>
          <DialogDescription>
            {isNewEvent ? 'Add a new event to your calendar' : 'Make changes to your event'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                name="title"
                defaultValue={event?.title}
                required
                placeholder="Event title"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  type="date"
                  id="startDate"
                  name="startDate"
                  defaultValue={event?.startTime ? format(event.startTime, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  type="time"
                  id="startTime"
                  name="startTime"
                  defaultValue={event?.startTime ? format(event.startTime, 'HH:mm') : '09:00'}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  type="date"
                  id="endDate"
                  name="endDate"
                  defaultValue={event?.endTime ? format(event.endTime, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd')}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  type="time"
                  id="endTime"
                  name="endTime"
                  defaultValue={event?.endTime ? format(event.endTime, 'HH:mm') : '10:00'}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                name="location"
                defaultValue={event?.location}
                placeholder="Event location"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Subject</Label>
                <Select
                  name="subject"
                  defaultValue={event?.subject}
                  onValueChange={(value) => {
                    setSelectedSubject(subjects.find(s => s.name === value));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Subjects</SelectLabel>
                      {subjects.map((subject) => (
                        <SelectItem 
                          key={subject._id?.toString()} 
                          value={subject.name}
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
                  name="teacherId"
                  defaultValue={event?.teacherId?.toString()}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select teacher" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Teachers</SelectLabel>
                      {teachers.map((teacher) => (
                        <SelectItem 
                          key={teacher._id?.toString()} 
                          value={teacher._id?.toString() || ''}
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

            {selectedSubject && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: selectedSubject.color }}
                />
                Event will use the subject's color
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            {!isNewEvent && onDelete && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => event && onDelete(event as IEvent)}
              >
                Delete
              </Button>
            )}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                {isNewEvent ? 'Create' : 'Save'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 