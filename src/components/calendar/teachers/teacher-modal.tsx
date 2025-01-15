"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TeachersForm } from "./teachers-form";
import { useToast } from "@/components/ui/use-toast";
import { ITeacher } from "@/lib/db/interfaces";

interface TeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId: string;
  onSuccess?: () => void;
  teacher?: ITeacher;
}

export function TeacherModal({ 
  isOpen, 
  onClose, 
  organizationId,
  onSuccess,
  teacher 
}: TeacherModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {
      const targetOrgId = teacher ? teacher.organizationId.toString() : organizationId;
      const url = teacher 
        ? `/api/teachers/${teacher._id}` 
        : `/api/organizations/${organizationId}/teachers`;
      const method = teacher ? "PATCH" : "POST";

      console.log('Submitting to:', url, 'with method:', method);
      console.log('Data:', data);

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          organizationId: targetOrgId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Response error:', response.status, errorData);
        throw new Error(errorData?.error || (teacher ? "Failed to update teacher" : "Failed to create teacher"));
      }

      toast({
        title: "Success",
        description: `Teacher ${teacher ? 'updated' : 'created'} successfully`,
      });
      onClose();
      onSuccess?.();
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : (teacher ? "Failed to update teacher" : "Failed to create teacher"),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{teacher ? 'Edit Teacher' : 'Create New Teacher'}</DialogTitle>
        </DialogHeader>
        <TeachersForm 
          onSubmit={handleSubmit} 
          initialData={teacher ? {
            name: teacher.name,
            email: teacher.email,
            phoneNumber: teacher.phoneNumber || "",
            subjects: teacher.subjects,
            color: teacher.color,
            maxHoursPerDay: teacher.maxHoursPerDay || 8,
            maxHoursPerWeek: teacher.maxHoursPerWeek || 40,
            availability: teacher.availability || [
              { dayOfWeek: 1, timeSlots: [] },
              { dayOfWeek: 2, timeSlots: [] },
              { dayOfWeek: 3, timeSlots: [] },
              { dayOfWeek: 4, timeSlots: [] },
              { dayOfWeek: 5, timeSlots: [] },
            ],
            preferences: teacher.preferences || {
              consecutiveHours: 4,
              breakDuration: 30,
              preferredDays: [],
            },
          } : undefined}
          isLoading={loading}
        />
      </DialogContent>
    </Dialog>
  );
}