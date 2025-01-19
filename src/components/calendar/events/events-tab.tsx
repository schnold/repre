"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ScheduleSelector } from "./schedule-selector";
import { EventModal } from "./event-modal";

interface EventsTabProps {
  organizationId: string;
}

export function EventsTab({ organizationId }: EventsTabProps) {
  const [selectedScheduleId, setSelectedScheduleId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleScheduleSelect = (scheduleId: string) => {
    setSelectedScheduleId(scheduleId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <ScheduleSelector 
          organizationId={organizationId} 
          onScheduleSelect={handleScheduleSelect}
        />
        {selectedScheduleId && (
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        )}
      </div>

      {selectedScheduleId && (
        <EventModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          scheduleId={selectedScheduleId}
          onSuccess={() => {
            // Refresh events list if needed
          }}
        />
      )}

      {/* Events list will be added here */}
    </div>
  );
} 