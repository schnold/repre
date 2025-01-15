"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { ScheduleModal } from "@/components/calendar/schedules/schedule-modal";
import { ScheduleCard } from "@/components/calendar/schedules/schedule-card";
import { ISchedule } from "@/lib/db/interfaces";
import { Skeleton } from "@/components/ui/skeleton";

interface OrganizationSchedulesProps {
  organizationId: string;
}

export function OrganizationSchedules({ organizationId }: OrganizationSchedulesProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [schedules, setSchedules] = useState<ISchedule[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchSchedules = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/organizations/${organizationId}/schedules`);
      if (response.ok) {
        const data = await response.json();
        setSchedules(data);
      }
    } catch (error) {
      console.error('Error fetching schedules:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchedules();
  }, [organizationId]);

  const filteredSchedules = schedules.filter(schedule =>
    schedule.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (schedule.description?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Schedules</h2>
        <Button onClick={() => setIsModalOpen(true)}>Add Schedule</Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search schedules..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-lg border">
              <div className="space-y-3">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSchedules.length === 0 ? (
            <div className="col-span-full text-center py-8 text-muted-foreground">
              {searchTerm ? "No schedules found matching your search" : "No schedules yet"}
            </div>
          ) : (
            filteredSchedules.map((schedule) => (
              <ScheduleCard 
                key={schedule._id.toString()} 
                schedule={schedule}
                onSuccess={fetchSchedules}
              />
            ))
          )}
        </div>
      )}

      <ScheduleModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        organizationId={organizationId}
        onSuccess={() => {
          setIsModalOpen(false);
          fetchSchedules();
        }}
      />
    </div>
  );
} 