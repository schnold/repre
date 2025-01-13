"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface TeacherScheduleProps {
  organizationId: string;
}

export function TeacherSchedule({ organizationId }: TeacherScheduleProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Teacher Schedule</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Schedule implementation will go here */}
        <div>Schedule view coming soon...</div>
      </CardContent>
    </Card>
  );
} 