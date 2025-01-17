"use client";

import { useEffect, useState, use } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IOrganization } from "@/lib/db/models/organization";
import { Skeleton } from "@/components/ui/skeleton";
import { Settings, Users, Calendar, Clock, BookOpen } from "lucide-react";
import { OrganizationSettings } from "@/components/organizations/organization-settings";
import { OrganizationTeachers } from "@/components/organizations/organization-teachers";
import { OrganizationSchedules } from "@/components/organizations/organization-schedules";
import { OrganizationEvents } from "@/components/organizations/organization-events";
import { OrganizationSubjects } from "@/components/organizations/organization-subjects";
import { useRouter } from "next/navigation";

export default function OrganizationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [organization, setOrganization] = useState<IOrganization | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If id is "new", redirect back to organizations page
    if (id === "new") {
      router.push("/organizations");
      return;
    }

    const fetchOrganization = async () => {
      try {
        const response = await fetch(`/api/organizations/${id}`);
        if (response.ok) {
          const data = await response.json();
          setOrganization({
            ...data,
            subjects: data.subjects || [],
            timeZone: data.timeZone || 'UTC',
            workingHours: data.workingHours || { start: '09:00', end: '17:00' }
          });
        }
      } catch (error) {
        console.error('Error fetching organization:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchOrganization();
    }
  }, [id, router]);

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold">Organization not found</h1>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{organization.name}</h1>
      </div>

      <Tabs defaultValue="settings" className="space-y-4">
        <TabsList>
          <TabsTrigger value="settings" className="gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="teachers" className="gap-2">
            <Users className="h-4 w-4" />
            Teachers
          </TabsTrigger>
          <TabsTrigger value="schedules" className="gap-2">
            <Calendar className="h-4 w-4" />
            Schedules
          </TabsTrigger>
          <TabsTrigger value="events" className="gap-2">
            <Clock className="h-4 w-4" />
            Events
          </TabsTrigger>
          <TabsTrigger value="subjects" className="gap-2">
            <BookOpen className="h-4 w-4" />
            Subjects
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Organization Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <OrganizationSettings organization={organization} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="teachers">
          <Card>
            <CardHeader>
              <CardTitle>Teachers</CardTitle>
            </CardHeader>
            <CardContent>
              <OrganizationTeachers organizationId={organization._id.toString()} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedules">
          <Card>
            <CardHeader>
              <CardTitle>Schedules</CardTitle>
            </CardHeader>
            <CardContent>
              <OrganizationSchedules organizationId={organization._id.toString()} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="events">
          <Card>
            <CardHeader>
              <CardTitle>Events</CardTitle>
            </CardHeader>
            <CardContent>
              <OrganizationEvents organizationId={organization._id.toString()} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="subjects">
          <Card>
            <CardHeader>
              <CardTitle>Subjects</CardTitle>
            </CardHeader>
            <CardContent>
              <OrganizationSubjects organizationId={organization._id.toString()} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 