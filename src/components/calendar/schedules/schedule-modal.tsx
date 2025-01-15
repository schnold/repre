"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScheduleForm } from "./schedule-form";
import { useToast } from "@/components/ui/use-toast";
import { ISchedule } from "@/lib/db/interfaces";

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId: string;
  onSuccess?: () => void;
  schedule?: ISchedule;
}

export function ScheduleModal({ 
  isOpen, 
  onClose, 
  organizationId,
  onSuccess,
  schedule 
}: ScheduleModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {
      const targetOrgId = schedule ? schedule.organizationId.toString() : organizationId;
      const url = schedule 
        ? `/api/schedules/${schedule._id}` 
        : `/api/organizations/${organizationId}/schedules`;
      const method = schedule ? "PATCH" : "POST";

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
        throw new Error(errorData?.error || (schedule ? "Failed to update schedule" : "Failed to create schedule"));
      }

      toast({
        title: "Success",
        description: `Schedule ${schedule ? 'updated' : 'created'} successfully`,
      });
      onClose();
      onSuccess?.();
    } catch (error) {
      console.error('Error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : (schedule ? "Failed to update schedule" : "Failed to create schedule"),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{schedule ? 'Edit Schedule' : 'Create New Schedule'}</DialogTitle>
        </DialogHeader>
        <ScheduleForm 
          onSubmit={handleSubmit} 
          initialData={schedule ? {
            name: schedule.name,
            description: schedule.description || "",
            color: schedule.color,
            status: schedule.status,
            settings: {
              allowedRooms: schedule.settings?.allowedRooms || [],
              allowedSubjects: schedule.settings?.allowedSubjects || [],
              maxEventsPerDay: schedule.settings?.maxEventsPerDay || 8,
              minEventDuration: schedule.settings?.minEventDuration || 30,
              maxEventDuration: schedule.settings?.maxEventDuration || 120,
            },
          } : undefined}
          isLoading={loading}
        />
      </DialogContent>
    </Dialog>
  );
} 