"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { ISchedule } from "@/lib/db/interfaces";
import { ScheduleModal } from "./schedule-modal";
import { useToast } from "@/components/ui/use-toast";

interface ScheduleCardProps {
  schedule: ISchedule;
  onSuccess?: () => void;
}

export function ScheduleCard({ schedule, onSuccess }: ScheduleCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { toast } = useToast();

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/schedules/${schedule._id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete schedule");
      }

      toast({
        title: "Success",
        description: "Schedule deleted successfully",
      });
      onSuccess?.();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete schedule",
      });
    }
  };

  return (
    <>
      <Card className="relative overflow-hidden">
        <div 
          className="absolute left-0 top-0 w-2 h-full" 
          style={{ backgroundColor: schedule.color || '#4B5563' }} 
        />
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="text-lg font-semibold">{schedule.name}</h3>
              {schedule.description && (
                <p className="text-sm text-muted-foreground mt-1">{schedule.description}</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditModalOpen(true)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Status</span>
              <span className="capitalize">{schedule.status}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Max Events/Day</span>
              <span>{schedule.settings?.maxEventsPerDay || '-'}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Event Duration</span>
              <span>{schedule.settings?.minEventDuration}-{schedule.settings?.maxEventDuration} min</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <ScheduleModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        organizationId={schedule.organizationId.toString()}
        schedule={schedule}
        onSuccess={() => {
          setIsEditModalOpen(false);
          onSuccess?.();
        }}
      />
    </>
  );
} 