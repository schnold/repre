"use client";

import { useEffect, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const eventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  teacherId: z.string().min(1, "Teacher is required"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  isRecurring: z.boolean().default(false),
  recurrence: z.object({
    frequency: z.enum(["daily", "weekly", "monthly"]).optional(),
    interval: z.number().min(1).optional(),
    daysOfWeek: z.array(z.number().min(0).max(6)).optional(),
    endsOn: z.string().optional(),
    count: z.number().min(1).optional(),
  }).optional(),
});

type EventFormValues = z.infer<typeof eventSchema>;

interface EventFormProps {
  onSubmit: (data: EventFormValues) => void;
  scheduleId: string;
  initialData?: EventFormValues;
  isLoading?: boolean;
}

interface Teacher {
  id: string;
  name: string;
}

export function EventForm({ 
  onSubmit, 
  scheduleId, 
  initialData,
  isLoading 
}: EventFormProps) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [teacherError, setTeacherError] = useState<string | null>(null);

  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventSchema),
    defaultValues: initialData || {
      title: "",
      description: "",
      teacherId: "",
      startTime: new Date().toISOString().slice(0, 16),
      endTime: new Date(Date.now() + 3600000).toISOString().slice(0, 16),
      isRecurring: false,
      recurrence: {
        frequency: "weekly",
        interval: 1,
        daysOfWeek: [],
      },
    },
  });

  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        // First get the schedule to get the organizationId
        const scheduleResponse = await fetch(`/api/schedules/${scheduleId}`);
        if (!scheduleResponse.ok) throw new Error("Failed to fetch schedule");
        const schedule = await scheduleResponse.json();

        // Then fetch the organization's teachers
        const teachersResponse = await fetch(`/api/organizations/${schedule.organizationId}/teachers`);
        if (!teachersResponse.ok) throw new Error("Failed to fetch teachers");
        const data = await teachersResponse.json();
        // Map the response data to match the Teacher interface
        const mappedTeachers = data.map((teacher: any) => ({
          id: teacher._id,
          name: teacher.name
        }));
        setTeachers(mappedTeachers);
      } catch (error) {
        setTeacherError("Failed to load teachers. Please try again later.");
      }
    };

    fetchTeachers();
  }, [scheduleId]);

  const watchIsRecurring = form.watch("isRecurring");
  const watchFrequency = form.watch("recurrence.frequency");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {teacherError && (
          <Alert variant="destructive">
            <AlertDescription>{teacherError}</AlertDescription>
          </Alert>
        )}

        {teachers.length === 0 && (
          <Alert>
            <AlertDescription>
              No teachers are available. Please add teachers to the organization first.
            </AlertDescription>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter event title" {...field} />
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
                <Textarea placeholder="Enter event description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="teacherId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Teacher</FormLabel>
              <Select 
                onValueChange={field.onChange} 
                defaultValue={field.value}
                disabled={teachers.length === 0}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a teacher" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Time</FormLabel>
                <FormControl>
                  <Input type="datetime-local" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="isRecurring"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Recurring Event</FormLabel>
                <FormDescription>
                  Make this event repeat on a schedule
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {watchIsRecurring && (
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="recurrence.frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frequency</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="recurrence.interval"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Interval</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="1" 
                      {...field}
                      onChange={e => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    {watchFrequency === "daily" && "Repeat every X days"}
                    {watchFrequency === "weekly" && "Repeat every X weeks"}
                    {watchFrequency === "monthly" && "Repeat every X months"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {watchFrequency === "weekly" && (
              <FormField
                control={form.control}
                name="recurrence.daysOfWeek"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Days of Week</FormLabel>
                    <div className="flex gap-2">
                      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day, index) => (
                        <Button
                          key={day}
                          type="button"
                          variant={field.value?.includes(index) ? "default" : "outline"}
                          className="w-12"
                          onClick={() => {
                            const currentValue = field.value || [];
                            const newValue = currentValue.includes(index)
                              ? currentValue.filter(d => d !== index)
                              : [...currentValue, index];
                            field.onChange(newValue);
                          }}
                        >
                          {day}
                        </Button>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="recurrence.endsOn"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ends On</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormDescription>
                    Leave empty for no end date
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="recurrence.count"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Occurrences</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="1" 
                      {...field}
                      onChange={e => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Leave empty for unlimited occurrences
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}

        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? "Update" : "Create"} Event
          </Button>
        </div>
      </form>
    </Form>
  );
} 