// src/components/teachers/teacher-form.tsx
"use client";

import React, { useState, useEffect } from 'react';
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
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Teacher } from '@/lib/types/teacher';
import { Badge } from "@/components/ui/badge";
import { X } from 'lucide-react';

interface TeacherFormProps {
  isOpen: boolean;
  onClose: () => void;
  initialData?: Partial<Teacher>;
  scheduleId: string;
}

interface TeacherFormData {
  name: string;
  email: string;
  phoneNumber: string;
  qualifications: string[];
  selectedSubjects: string[];
  availability: {
    dayOfWeek: number;
    timeSlots: { start: string; end: string }[];
  }[];
  role: 'fulltime' | 'parttime' | 'substitute';
  maxHoursPerWeek: number;
  color: string;
}

export const TeacherForm: React.FC<TeacherFormProps> = ({
  isOpen,
  onClose,
  initialData,
  scheduleId
}) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);

  // Form state
  const [formData, setFormData] = useState<TeacherFormData>({
    name: '',
    email: '',
    phoneNumber: '',
    qualifications: [],
    selectedSubjects: [],
    availability: [
      { dayOfWeek: 1, timeSlots: [{ start: '08:00', end: '16:00' }] },
      { dayOfWeek: 2, timeSlots: [{ start: '08:00', end: '16:00' }] },
      { dayOfWeek: 3, timeSlots: [{ start: '08:00', end: '16:00' }] },
      { dayOfWeek: 4, timeSlots: [{ start: '08:00', end: '16:00' }] },
      { dayOfWeek: 5, timeSlots: [{ start: '08:00', end: '16:00' }] },
    ],
    role: 'fulltime',
    maxHoursPerWeek: 40,
    color: '#' + Math.floor(Math.random()*16777215).toString(16)
  });

  // Fetch available subjects for the schedule
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch(`/api/schedules/${scheduleId}/subjects`);
        if (!response.ok) throw new Error('Failed to fetch subjects');
        const data = await response.json();
        setAvailableSubjects(data.subjects);
      } catch (error) {
        console.error('Error fetching subjects:', error);
        toast({
          title: "Error",
          description: "Failed to load subjects. Please try again.",
          variant: "destructive",
        });
      }
    };

    fetchSubjects();
  }, [scheduleId, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = initialData?.id 
        ? `/api/teachers/${initialData.id}`
        : '/api/teachers';
      
      const response = await fetch(url, {
        method: initialData?.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          scheduleId
        }),
      });

      if (!response.ok) throw new Error('Failed to save teacher');

      toast({
        title: "Success",
        description: `Teacher ${initialData?.id ? 'updated' : 'created'} successfully.`,
      });

      onClose();
    } catch (error) {
      console.error('Error saving teacher:', error);
      toast({
        title: "Error",
        description: "Failed to save teacher. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubjectToggle = (subject: string) => {
    setFormData(prev => ({
      ...prev,
      selectedSubjects: prev.selectedSubjects.includes(subject)
        ? prev.selectedSubjects.filter(s => s !== subject)
        : [...prev.selectedSubjects, subject]
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {initialData?.id ? 'Edit Teacher' : 'Add New Teacher'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  name: e.target.value
                }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  email: e.target.value
                }))}
                required
              />
            </div>
          </div>

          {/* Role and Working Hours */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={formData.role}
                onValueChange={(value: 'fulltime' | 'parttime' | 'substitute') => 
                  setFormData(prev => ({ ...prev, role: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fulltime">Full Time</SelectItem>
                  <SelectItem value="parttime">Part Time</SelectItem>
                  <SelectItem value="substitute">Substitute</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxHours">Maximum Hours per Week</Label>
              <Input
                id="maxHours"
                type="number"
                min="1"
                max="60"
                value={formData.maxHoursPerWeek}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  maxHoursPerWeek: parseInt(e.target.value)
                }))}
              />
            </div>
          </div>

          {/* Subjects */}
          <div className="space-y-2">
            <Label>Subjects</Label>
            <div className="flex flex-wrap gap-2 p-2 border rounded-md">
              {availableSubjects.map(subject => (
                <Badge
                  key={subject}
                  variant={formData.selectedSubjects.includes(subject) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => handleSubjectToggle(subject)}
                >
                  {subject}
                  {formData.selectedSubjects.includes(subject) && (
                    <X className="ml-1 h-3 w-3" />
                  )}
                </Badge>
              ))}
            </div>
          </div>

          {/* Availability */}
          <div className="space-y-4">
            <Label>Weekly Availability</Label>
            <div className="grid gap-4">
              {formData.availability.map((day, index) => (
                <div key={day.dayOfWeek} className="flex items-center gap-4">
                  <span className="w-20">
                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'][index]}
                  </span>
                  <div className="flex-1 space-y-2">
                    {day.timeSlots.map((slot, slotIndex) => (
                      <div key={slotIndex} className="flex gap-2 items-center">
                        <Input
                          type="time"
                          value={slot.start}
                          onChange={(e) => {
                            const newAvailability = [...formData.availability];
                            newAvailability[index].timeSlots[slotIndex].start = e.target.value;
                            setFormData(prev => ({
                              ...prev,
                              availability: newAvailability
                            }));
                          }}
                        />
                        <span>to</span>
                        <Input
                          type="time"
                          value={slot.end}
                          onChange={(e) => {
                            const newAvailability = [...formData.availability];
                            newAvailability[index].timeSlots[slotIndex].end = e.target.value;
                            setFormData(prev => ({
                              ...prev,
                              availability: newAvailability
                            }));
                          }}
                        />
                        {day.timeSlots.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const newAvailability = [...formData.availability];
                              newAvailability[index].timeSlots = 
                                newAvailability[index].timeSlots.filter((_, i) => i !== slotIndex);
                              setFormData(prev => ({
                                ...prev,
                                availability: newAvailability
                              }));
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const newAvailability = [...formData.availability];
                        newAvailability[index].timeSlots.push({ start: '09:00', end: '17:00' });
                        setFormData(prev => ({
                          ...prev,
                          availability: newAvailability
                        }));
                      }}
                    >
                      Add Time Slot
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : (initialData?.id ? 'Update' : 'Create')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};