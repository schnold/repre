"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { TeacherList } from "@/components/teachers/teacher-list";
import { TeacherAvailabilitySettings } from "@/components/teachers/teacher-availability-settings";
import { TeacherSubjects } from "@/components/teachers/teacher-subjects";
import { TeacherSchedule } from "@/components/teachers/teacher-schedule";
import { useOrganizations } from "@/hooks/use-organizations";

export default function TeacherSettingsPage() {
  const { currentOrg } = useOrganizations();

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Teacher Management</h1>
      
      <Tabs defaultValue="teachers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="teachers">Teachers</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
          <TabsTrigger value="subjects">Subject Assignment</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="teachers">
          {currentOrg && <TeacherList organizationId={currentOrg} />}
        </TabsContent>

        <TabsContent value="availability">
          {currentOrg && <TeacherAvailabilitySettings organizationId={currentOrg} />}
        </TabsContent>

        <TabsContent value="subjects">
          {currentOrg && <TeacherSubjects organizationId={currentOrg} />}
        </TabsContent>

        <TabsContent value="schedule">
          {currentOrg && <TeacherSchedule organizationId={currentOrg} />}
        </TabsContent>
      </Tabs>
    </div>
  );
} 