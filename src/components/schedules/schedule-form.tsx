"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { ISchedule } from '@/lib/db/interfaces';
import { useUser } from '@auth0/nextjs-auth0/client';
import { TimezoneSelect } from '@/components/ui/timezone-select';
import { fetchWithAuth } from '@/lib/api/fetch-with-auth';

interface ScheduleFormProps {
  organizationId: string;
  initialData?: Partial<ISchedule> & { _id?: string };
  onSuccess?: () => void;
}

export function ScheduleForm({ organizationId, initialData, onSuccess }: ScheduleFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: initialData?.name ?? '',
    description: initialData?.description ?? '',
    dateRange: {
      start: initialData?.dateRange?.start ? new Date(initialData.dateRange.start).toISOString().split('T')[0] : '',
      end: initialData?.dateRange?.end ? new Date(initialData.dateRange.end).toISOString().split('T')[0] : ''
    },
    workingHours: {
      start: initialData?.workingHours?.start ?? '08:00',
      end: initialData?.workingHours?.end ?? '17:00'
    },
    settings: {
      allowedRooms: initialData?.settings?.allowedRooms ?? [],
      allowedSubjects: initialData?.settings?.allowedSubjects ?? [],
      maxEventsPerDay: initialData?.settings?.maxEventsPerDay ?? undefined,
      minEventDuration: initialData?.settings?.minEventDuration ?? undefined,
      maxEventDuration: initialData?.settings?.maxEventDuration ?? undefined
    },
    status: initialData?.status ?? 'active'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const url = initialData?._id 
        ? `/api/schedules/${initialData._id}`
        : '/api/schedules';

      const response = await fetchWithAuth(url, {
        method: initialData?._id ? 'PUT' : 'POST',
        user,
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          organizationId,
          startDate: new Date(formData.dateRange.start),
          endDate: new Date(formData.dateRange.end),
          workingHours: formData.workingHours,
          settings: formData.settings,
          status: formData.status
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save schedule');
      }

      toast({
        title: "Success",
        children: `Schedule ${initialData?._id ? 'updated' : 'created'} successfully`
      });

      if (onSuccess) {
        onSuccess();
      } else {
        router.push('/schedules');
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        children: error.message || "Failed to save schedule"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Schedule Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.dateRange.start}
                onChange={(e) => setFormData({
                  ...formData,
                  dateRange: { ...formData.dateRange, start: e.target.value }
                })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.dateRange.end}
                onChange={(e) => setFormData({
                  ...formData,
                  dateRange: { ...formData.dateRange, end: e.target.value }
                })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startTime">Working Hours Start</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.workingHours.start}
                onChange={(e) => setFormData({
                  ...formData,
                  workingHours: { ...formData.workingHours, start: e.target.value }
                })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endTime">Working Hours End</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.workingHours.end}
                onChange={(e) => setFormData({
                  ...formData,
                  workingHours: { ...formData.workingHours, end: e.target.value }
                })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'draft' | 'archived' })}
              className="w-full p-2 border rounded"
            >
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : (initialData?._id ? 'Update' : 'Create')}
        </Button>
      </div>
    </form>
  );
} 