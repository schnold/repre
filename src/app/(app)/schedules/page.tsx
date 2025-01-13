'use client';

import { useEffect } from 'react';
import { useOrganizations } from '@/hooks/use-organizations';
import { useOrganizationData } from '@/hooks/use-organization-data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { ScheduleList } from '@/components/schedules/schedule-list';
import { ScheduleForm } from '@/components/schedules/schedule-form';
import { useState } from 'react';
import { ISchedule } from '@/lib/db/schemas';

export default function SchedulesPage() {
  const { currentOrg } = useOrganizations();
  const { data: orgData, isLoading } = useOrganizationData();
  const [isCreating, setIsCreating] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Partial<ISchedule> | null>(null);

  if (!currentOrg) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Please select an organization</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading schedules...</p>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Schedules</h1>
        <Button onClick={() => setIsCreating(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Schedule
        </Button>
      </div>

      <div className="grid gap-6">
        {(isCreating || editingSchedule) && (
          <Card>
            <CardHeader>
              <CardTitle>
                {editingSchedule ? 'Edit Schedule' : 'Create Schedule'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScheduleForm
                schedule={editingSchedule}
                onSubmit={(schedule) => {
                  setIsCreating(false);
                  setEditingSchedule(null);
                }}
                onCancel={() => {
                  setIsCreating(false);
                  setEditingSchedule(null);
                }}
              />
            </CardContent>
          </Card>
        )}

        <ScheduleList
          schedules={orgData?.schedules ?? []}
          onEdit={setEditingSchedule}
        />
      </div>
    </div>
  );
} 