// FILE: /src/app/(app)/dashboard/page.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrganizationContext } from "@/providers/organization-provider";
import { useEffect, useState } from "react";
import { ITeacher } from "@/lib/db/interfaces";

export default function DashboardPage() {
  const { selectedOrganization, isLoading } = useOrganizationContext();
  const [teachers, setTeachers] = useState<ITeacher[]>([]);
  const [schedules, setSchedules] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!selectedOrganization) return;

      try {
        const [teachersRes, schedulesRes] = await Promise.all([
          fetch(`/api/organizations/${selectedOrganization._id}/teachers`),
          fetch(`/api/organizations/${selectedOrganization._id}/schedules`)
        ]);

        const [teachersData, schedulesData] = await Promise.all([
          teachersRes.json(),
          schedulesRes.json()
        ]);

        setTeachers(teachersData);
        setSchedules(schedulesData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, [selectedOrganization]);

  if (isLoading || loadingData) {
    return (
      <div className="container mx-auto py-8 space-y-6">
        <Skeleton className="h-8 w-[300px]" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  if (!selectedOrganization) {
    return null; // The provider will handle the redirect
  }

  const activeTeachers = teachers.filter(t => t.status === 'active').length;
  const activeSchedules = schedules.filter(s => s.status === 'active').length;

  return (
    <div className="container mx-auto py-8 space-y-6">
      <h1 className="text-3xl font-bold">
        {selectedOrganization.name} Dashboard
      </h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Teachers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{activeTeachers}</p>
            <p className="text-sm text-muted-foreground">Active teachers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Classes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{selectedOrganization.classes?.length || 0}</p>
            <p className="text-sm text-muted-foreground">Total classes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Schedules</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{activeSchedules}</p>
            <p className="text-sm text-muted-foreground">Active schedules</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}