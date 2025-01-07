import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { useCalendarStore } from '@/store/calendar-store';
import { useTeacherStore } from '@/store/teacher-store';
import { CalendarEvent, EventCategory } from '@/lib/types/calendar';
import { Teacher } from '@/lib/types/teacher';
import { AlertCircle, Clock } from 'lucide-react';

interface EventFormData {
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  category: EventCategory;
  teacherId?: string;
  substituteTeacherId?: string;
  color?: string;
  isRecurring?: boolean;
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

  const { teachers } = useTeacherStore();
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    description: '',
    startTime: new Date().toISOString().slice(0, 16),
    endTime: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
    location: '',
    category: 'work',
    color: "#BFD5FF"
  });

  const [errors, setErrors] = useState<Partial<EventFormData>>({});
  const [teacherConflict, setTeacherConflict] = useState<string | null>(null);

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
          category: event.category,
          teacherId: event.teacherId,
          substituteTeacherId: event.substituteTeacherId,
          color: event.color || "#BFD5FF",
          isRecurring: event.isRecurring
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
        category: 'work',
        color: "#BFD5FF"
      });
    }
  }, [selectedEventId, modalMode, events]);

  const checkTeacherAvailability = (teacherId: string, startTime: Date, endTime: Date): boolean => {
    // Check if teacher has any other events at this time
    return !events.some(event => 
      event.teacherId === teacherId &&
      event.id !== selectedEventId && // Exclude current event when editing
      ((event.startTime <= startTime && event.endTime > startTime) ||
       (event.startTime < endTime && event.endTime >= endTime) ||
       (event.startTime >= startTime && event.endTime <= endTime))
    );
  };

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

    // Teacher availability check
    if (formData.teacherId) {
      const isAvailable = checkTeacherAvailability(formData.teacherId, startDate, endDate);
      if (!isAvailable) {
        setTeacherConflict('Selected teacher has a scheduling conflict');
        isValid = false;
      } else {
        setTeacherConflict(null);
      }
    }

    setErrors(newErrors);
    return isValid;
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
      category: formData.category,
      teacherId: formData.teacherId,
      substituteTeacherId: formData.substituteTeacherId,
      color: formData.color,
      isRecurring: formData.isRecurring
    };

    if (modalMode === 'edit' && selectedEventId) {
      updateEvent(selectedEventId, eventData);
    } else {
      addEvent(eventData);
    }

    setEventModalOpen(false);
  };

  // Filter out the main teacher from substitute options
  const availableSubstitutes = teachers.filter(t => t.id !== formData.teacherId);

  // Get teacher name helper
  const getTeacherName = (teacherId?: string) => {
    if (!teacherId) return '';
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? teacher.name : '';
  };

  return (
    <Dialog open={isEventModalOpen} onOpenChange={setEventModalOpen}>
      <DialogContent className="sm:max-w-[475px]">
        <DialogHeader>
          <DialogTitle>
            {modalMode === 'edit' ? 'Edit Lesson' : 'Create New Lesson'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {teacherConflict && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Scheduling Conflict</AlertTitle>
              <AlertDescription>{teacherConflict}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="title">Lesson Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className={cn(errors.title && "border-red-500")}
              placeholder="e.g., Mathematics Class 10A"
            />
            {errors.title && (
              <span className="text-xs text-red-500">{errors.title}</span>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="teacher">Main Teacher</Label>
            <Select
              value={formData.teacherId || ''}
              onValueChange={(value) => setFormData({ ...formData, teacherId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a Teacher" />
              </SelectTrigger>
              <SelectContent>
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
                    {teacher.name} ({teacher.subjects.join(', ')})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="substitute">Substitute Teacher</Label>
            <Select
              value={formData.substituteTeacherId || ''}
              onValueChange={(value) => 
                setFormData({ ...formData, substituteTeacherId: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="(Optional) Select Substitute" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No Substitute Needed</SelectItem>
                {availableSubstitutes.map((teacher) => (
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
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Start Time</Label>
              <div className="relative">
                <Clock className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="pl-8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endTime">End Time</Label>
              <div className="relative">
                <Clock className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className={cn("pl-8", errors.endTime && "border-red-500")}
                />
                {errors.endTime && (
                  <span className="text-xs text-red-500">{errors.endTime}</span>
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
              placeholder="e.g., Room 101"
            />
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

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setEventModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {modalMode === 'edit' ? 'Update' : 'Create'} Lesson
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EventModal;