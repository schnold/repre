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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SubjectSelector } from "./subject-selector";
import { ColorPicker } from "@/components/ui/color-picker";
import { TeacherAvailability } from "./teacher-availability";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useOrganizations } from "@/hooks/use-organizations";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MultiSelect } from "../ui/multi-select";

const teacherSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phoneNumber: z.string().optional(),
  organizationIds: z.array(z.string()).min(1, "At least one organization is required"),
  subjects: z.array(z.string()).min(1, "At least one subject is required"),
  color: z.string(),
  maxHoursPerDay: z.number().min(1).max(12),
  maxHoursPerWeek: z.number().min(1).max(60),
  availability: z.array(z.object({
    dayOfWeek: z.number().min(1).max(7),
    timeSlots: z.array(z.object({
      start: z.string(),
      end: z.string()
    }))
  })),
  preferences: z.object({
    consecutiveHours: z.number().min(1).max(8),
    breakDuration: z.number().min(0).max(120),
    preferredDays: z.array(z.number().min(1).max(7))
  })
});

export type TeacherFormData = z.infer<typeof teacherSchema>;

interface TeacherFormProps {
  onSubmit: (data: TeacherFormData) => Promise<void>;
  isLoading?: boolean;
}

export function TeacherForm({ onSubmit, isLoading }: TeacherFormProps) {
  const [apiError, setApiError] = useState<string | null>(null);
  const { organizations } = useOrganizations();
  
  const form = useForm<TeacherFormData>({
    resolver: zodResolver(teacherSchema),
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      organizationIds: [],
      subjects: [],
      color: "#3b82f6",
      maxHoursPerDay: 8,
      maxHoursPerWeek: 40,
      availability: [
        { dayOfWeek: 1, timeSlots: [] },
        { dayOfWeek: 2, timeSlots: [] },
        { dayOfWeek: 3, timeSlots: [] },
        { dayOfWeek: 4, timeSlots: [] },
        { dayOfWeek: 5, timeSlots: [] }
      ],
      preferences: {
        consecutiveHours: 4,
        breakDuration: 30,
        preferredDays: []
      }
    },
  });

  const handleSubmit = async (data: TeacherFormData) => {
    try {
      setApiError(null);
      const formattedData = {
        ...data,
        organizationIds: data.organizationIds.map(id => id.toString())
      };
      await onSubmit(formattedData);
    } catch (error) {
      if (error && typeof error === 'object' && 'error' in error) {
        const apiError = error as { error: string; details?: { [key: string]: string } };
        
        if (apiError.details) {
          Object.keys(apiError.details).forEach((key) => {
            form.setError(key as any, {
              type: 'server',
              message: apiError.details![key]
            });
          });
        }
        
        setApiError(apiError.error);
      } else {
        setApiError('An unexpected error occurred. Please try again later.');
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {apiError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{apiError}</AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input type="email" placeholder="john@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number (Optional)</FormLabel>
              <FormControl>
                <Input placeholder="+1 234 567 890" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="organizationIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organizations</FormLabel>
              <FormControl>
                <MultiSelect
                  placeholder="Select organizations"
                  options={organizations.map(org => ({
                    label: org.name,
                    value: org._id.toString()
                  }))}
                  value={field.value.map(id => id.toString())}
                  onChange={(values: string[]) => field.onChange(values.map(v => v.toString()))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="subjects"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Subjects</FormLabel>
              <FormControl>
                <SubjectSelector
                  value={field.value}
                  onChange={field.onChange}
                  organizationIds={form.watch('organizationIds')}
                />
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
                <ColorPicker
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          <h3 className="font-medium text-lg">Availability & Preferences</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="maxHoursPerDay"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Hours Per Day</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="maxHoursPerWeek"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Hours Per Week</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="availability"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Weekly Availability</FormLabel>
                <FormControl>
                  <TeacherAvailability
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="preferences.consecutiveHours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Consecutive Hours</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="preferences.breakDuration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Break Duration (minutes)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Saving..." : "Save Teacher"}
        </Button>
      </form>
    </Form>
  );
} 