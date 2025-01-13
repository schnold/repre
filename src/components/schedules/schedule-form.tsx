'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ISchedule } from '@/lib/db/schemas';
import { useOrganizations } from '@/hooks/use-organizations';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { TimeGrid } from '@/components/schedules/time-grid';

const scheduleSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  academicYear: z.string().min(1, 'Academic year is required'),
  term: z.string().min(1, 'Term is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  workingDays: z.array(z.number()),
  defaultWorkingHours: z.object({
    start: z.string(),
    end: z.string(),
  }),
  breaks: z.array(z.object({
    name: z.string(),
    startTime: z.string(),
    endTime: z.string(),
    days: z.array(z.number()),
  })),
  status: z.enum(['draft', 'active', 'archived']),
});

type FormData = z.infer<typeof scheduleSchema>;

interface ScheduleFormProps {
  schedule?: Partial<ISchedule> | null;
  onSubmit: (data: FormData) => void;
  onCancel: () => void;
}

export function ScheduleForm({ schedule, onSubmit, onCancel }: ScheduleFormProps) {
  const { currentOrg } = useOrganizations();
  const form = useForm<FormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: {
      name: schedule?.name || '',
      academicYear: schedule?.academicYear || new Date().getFullYear().toString(),
      term: schedule?.term || '',
      startDate: schedule?.startDate ? new Date(schedule.startDate).toISOString().split('T')[0] : '',
      endDate: schedule?.endDate ? new Date(schedule.endDate).toISOString().split('T')[0] : '',
      workingDays: schedule?.workingDays || [1, 2, 3, 4, 5], // Mon-Fri by default
      defaultWorkingHours: schedule?.defaultWorkingHours || {
        start: '08:00',
        end: '16:00',
      },
      breaks: schedule?.breaks || [],
      status: schedule?.status || 'draft',
    },
  });

  const handleSubmit = async (data: FormData) => {
    if (!currentOrg) return;

    try {
      const response = await fetch(`/api/organizations/${currentOrg}/schedules${schedule?._id ? `/${schedule._id}` : ''}`, {
        method: schedule?._id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to save schedule');
      }

      const savedSchedule = await response.json();
      onSubmit(savedSchedule);
    } catch (error) {
      console.error('Error saving schedule:', error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Schedule name" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="academicYear"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Academic Year</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="2023-2024" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="term"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Term</FormLabel>
              <FormControl>
                <Input {...field} placeholder="Fall Semester" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="status"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Status</FormLabel>
              <Select
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <TimeGrid
          workingDays={form.watch('workingDays')}
          defaultWorkingHours={form.watch('defaultWorkingHours')}
          breaks={form.watch('breaks')}
          onWorkingDaysChange={(days) => form.setValue('workingDays', days)}
          onWorkingHoursChange={(hours) => form.setValue('defaultWorkingHours', hours)}
          onBreaksChange={(breaks) => form.setValue('breaks', breaks)}
        />

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {schedule?._id ? 'Update' : 'Create'} Schedule
          </Button>
        </div>
      </form>
    </Form>
  );
} 