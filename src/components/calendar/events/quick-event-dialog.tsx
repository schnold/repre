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
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { defaultColors } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface QuickEventDialogProps {
  event: Partial<IEvent> | null;
  teachers: ITeacher[];
  subjects: ISubject[];
  isOpen: boolean;
  position: { x: number; y: number } | null;
  onClose: () => void;
  onSave: (event: Partial<IEvent>) => void;
}

export function QuickEventDialog({
  event,
  teachers = [],
  subjects = [],
  isOpen,
  position,
  onClose,
  onSave
}: QuickEventDialogProps) {
  const [selectedSubject, setSelectedSubject] = React.useState<ISubject | undefined>(
    event?.subject ? subjects.find(s => s.name === event.subject) : undefined
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const updatedEvent: Partial<IEvent> = {
      ...event,
      title: formData.get('title') as string,
      subject: formData.get('subject') as string,
      teacherId: new Types.ObjectId(formData.get('teacherId') as string),
      startTime: event?.startTime,
      endTime: event?.endTime,
      status: 'scheduled'
    };

    onSave(updatedEvent);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="sm:max-w-[425px]"
        style={position ? {
          position: 'absolute',
          top: position.y,
          left: position.x,
        } : undefined}
      >
        <DialogHeader>
          <DialogTitle>Quick Add Event</DialogTitle>
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
                autoFocus
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

          <DialogFooter>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">
                Create
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 