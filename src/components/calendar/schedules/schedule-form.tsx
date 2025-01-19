"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ColorPicker } from "@/components/ui/color-picker";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";

const scheduleSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  color: z.string(),
  status: z.enum(["active", "draft", "archived"]),
  settings: z.object({
    allowedRooms: z.array(z.string()),
    allowedSubjects: z.array(z.string()),
    maxEventsPerDay: z.number().min(1, "Must be at least 1").optional(),
    minEventDuration: z.number().min(15, "Must be at least 15 minutes").optional(),
    maxEventDuration: z.number().min(15, "Must be at least 15 minutes").optional(),
    totalWeeklyHours: z.number().min(1, "Must be at least 1 hour"),
    subjectHours: z.array(z.object({
      subject: z.string(),
      minimumHours: z.number().min(0)
    }))
  }),
});

interface ScheduleFormProps {
  onSubmit: (data: any) => Promise<void>;
  initialData?: any;
  isLoading?: boolean;
  organizationId: string;
}

interface SubjectHours {
  subject: string;
  minimumHours: number;
}

export function ScheduleForm({ onSubmit, initialData, isLoading, organizationId }: ScheduleFormProps) {
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const response = await fetch(`/api/organizations/${organizationId}/teachers`);
        if (response.ok) {
          const teachers = await response.json();
          const subjects = new Set<string>();
          teachers.forEach((teacher: any) => {
            teacher.subjects.forEach((subject: string) => subjects.add(subject));
          });
          setAvailableSubjects(Array.from(subjects));
        }
      } catch (error) {
        console.error('Error fetching subjects:', error);
      }
    };
    fetchSubjects();
  }, [organizationId]);

  const form = useForm({
    resolver: zodResolver(scheduleSchema),
    defaultValues: initialData || {
      name: "",
      description: "",
      color: "#4B5563",
      status: "draft",
      settings: {
        allowedRooms: [],
        allowedSubjects: [],
        maxEventsPerDay: 8,
        minEventDuration: 30,
        maxEventDuration: 120,
        totalWeeklyHours: 40,
        subjectHours: []
      },
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="color"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color</FormLabel>
                <FormControl>
                  <ColorPicker {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                  >
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Settings</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="settings.maxEventsPerDay"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Events Per Day</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      onChange={e => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="settings.minEventDuration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Min Event Duration (minutes)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      onChange={e => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="settings.maxEventDuration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Event Duration (minutes)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      {...field} 
                      onChange={e => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Teaching Hours Requirements</h3>
          
          <FormField
            control={form.control}
            name="settings.totalWeeklyHours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Total Weekly Hours</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    {...field} 
                    onChange={e => field.onChange(Number(e.target.value))}
                  />
                </FormControl>
                <FormDescription>
                  Total teaching hours required per week
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <h4 className="font-medium">Minimum Hours per Subject</h4>
            {availableSubjects.map((subject) => {
              const subjectHours = form.getValues('settings.subjectHours') || [];
              const existingHours = subjectHours.find((sh: SubjectHours) => sh?.subject === subject)?.minimumHours || 0;
              
              return (
                <FormField
                  key={subject}
                  control={form.control}
                  name="settings.subjectHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{subject}</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          step="0.5"
                          defaultValue={existingHours}
                          onBlur={(e) => {
                            const value = Number(e.target.value);
                            const currentHours = [...(field.value || [])];
                            const existingIndex = currentHours.findIndex((sh: SubjectHours) => sh?.subject === subject);
                            
                            if (existingIndex >= 0) {
                              currentHours[existingIndex] = { subject, minimumHours: value };
                            } else {
                              currentHours.push({ subject, minimumHours: value });
                            }
                            
                            field.onChange(currentHours);
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Minimum hours required for {subject}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              );
            })}
          </div>
        </div>

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? (
            <span className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              {initialData ? 'Updating...' : 'Creating...'}
            </span>
          ) : (
            <>{initialData ? 'Update' : 'Create'} Schedule</>
          )}
        </Button>
      </form>
    </Form>
  );
} 