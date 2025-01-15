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
  }),
});

interface ScheduleFormProps {
  onSubmit: (data: any) => Promise<void>;
  initialData?: any;
  isLoading?: boolean;
}

export function ScheduleForm({ onSubmit, initialData, isLoading }: ScheduleFormProps) {
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