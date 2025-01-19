"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { ISchedule } from "@/lib/db/interfaces";
import { ScheduleModal } from "./schedule-modal";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

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

          <div className="space-y-4">
            {/* Basic Settings */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Basic Settings</h4>
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <Badge variant={schedule.status === 'active' ? 'default' : 'secondary'}>
                      {schedule.status}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Events/Day</span>
                    <span>{schedule.settings?.maxEventsPerDay || '-'}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Event Duration</span>
                    <span>{schedule.settings?.minEventDuration}-{schedule.settings?.maxEventDuration} min</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Working Hours</h4>
                <div className="space-y-1">
                  {schedule.workingHours?.start && schedule.workingHours?.end ? (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Hours</span>
                      <span>{schedule.workingHours.start} - {schedule.workingHours.end}</span>
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">Not set</span>
                  )}
                  {schedule.dateRange?.start && schedule.dateRange?.end && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Date Range</span>
                      <span>
                        {new Date(schedule.dateRange.start).toLocaleDateString()} - 
                        {new Date(schedule.dateRange.end).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Teaching Requirements */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Teaching Requirements</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total Weekly Hours</span>
                  <span className="font-medium">{schedule.settings?.totalWeeklyHours || 0}h</span>
                </div>
                {schedule.settings?.subjectHours && schedule.settings.subjectHours.length > 0 && (
                  <div className="space-y-1">
                    <span className="text-sm text-muted-foreground">Subject Hours:</span>
                    <div className="grid grid-cols-2 gap-2">
                      {schedule.settings.subjectHours.map((sh) => (
                        <div key={sh.subject} className="flex items-center justify-between text-sm bg-muted/50 rounded-md p-1">
                          <span>{sh.subject}</span>
                          <span>{sh.minimumHours}h</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
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