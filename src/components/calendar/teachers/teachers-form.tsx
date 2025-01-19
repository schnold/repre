// src/components/teachers/teacher-form.tsx
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Types } from "mongoose";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SubjectSelector } from "@/components/teachers/subject-selector";
import { ColorPicker } from "@/components/ui/color-picker";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";

const timeSlotSchema = z.object({
  start: z.string(),
  end: z.string(),
});

const availabilitySchema = z.object({
  dayOfWeek: z.number(),
  timeSlots: z.array(timeSlotSchema),
});

const teacherSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  phoneNumber: z.string().optional(),
  subjects: z.array(z.string()).min(1, "At least one subject is required"),
  status: z.enum(["active", "inactive", "substitute"]),
  color: z.string(),
  maxHoursPerDay: z.number().min(1, "Must be at least 1 hour").max(24, "Cannot exceed 24 hours"),
  maxHoursPerWeek: z.number().min(1, "Must be at least 1 hour").max(168, "Cannot exceed 168 hours"),
  organizationIds: z.array(z.string()),
  availability: z.array(availabilitySchema),
  preferences: z.object({
    consecutiveHours: z.number().min(1, "Must be at least 1 hour"),
    breakDuration: z.number().min(0, "Cannot be negative"),
    preferredDays: z.array(z.number()),
  }),
});

interface TeachersFormProps {
  onSubmit: (data: any) => Promise<void>;
  initialData?: any;
  isLoading?: boolean;
}

export function TeachersForm({ onSubmit, initialData, isLoading }: TeachersFormProps) {
  const { toast } = useToast();
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(true);

  const form = useForm({
    resolver: zodResolver(teacherSchema),
    defaultValues: initialData ? {
      ...initialData,
      organizationIds: initialData.organizationIds?.map((id: Types.ObjectId) => id.toString()) || []
    } : {
      name: "",
      email: "",
      phoneNumber: "",
      subjects: [],
      status: "inactive",
      color: "#000000",
      organizationIds: [],
      maxHoursPerDay: 8,
      maxHoursPerWeek: 40,
      availability: [
        { dayOfWeek: 1, timeSlots: [] },
        { dayOfWeek: 2, timeSlots: [] },
        { dayOfWeek: 3, timeSlots: [] },
        { dayOfWeek: 4, timeSlots: [] },
        { dayOfWeek: 5, timeSlots: [] },
      ],
      preferences: {
        consecutiveHours: 4,
        breakDuration: 30,
        preferredDays: [],
      },
    },
  });

  const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  const addTimeSlot = (dayIndex: number) => {
    const availability = [...form.getValues('availability')];
    const day = availability[dayIndex];
    if (day) {
      day.timeSlots = [...day.timeSlots, { start: '09:00', end: '17:00' }];
      form.setValue('availability', availability, { shouldValidate: true });
    }
  };

  const removeTimeSlot = (dayIndex: number, slotIndex: number) => {
    const availability = [...form.getValues('availability')];
    const day = availability[dayIndex];
    if (day) {
      day.timeSlots = day.timeSlots.filter((_: any, index: number) => index !== slotIndex);
      form.setValue('availability', availability, { shouldValidate: true });
    }
  };

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        setLoadingOrgs(true);
        const response = await fetch('/api/organizations');
        if (!response.ok) throw new Error('Failed to fetch organizations');
        const { organizations: orgs } = await response.json();
        setOrganizations(orgs);
      } catch (error) {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load organizations",
        });
      } finally {
        setLoadingOrgs(false);
      }
    };

    fetchOrganizations();
  }, [toast]);

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
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" {...field} />
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
                  <Input {...field} />
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
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="substitute">Substitute</SelectItem>
                  </SelectContent>
                </Select>
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

          <FormField
            control={form.control}
            name="organizationIds"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Organizations</FormLabel>
                <FormControl>
                  <select
                    multiple
                    className="w-full h-32 rounded-md border border-input bg-background px-3 py-2"
                    disabled={loadingOrgs}
                    value={field.value}
                    onChange={(e) => {
                      const selectedOptions = Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value);
                      field.onChange(selectedOptions);
                    }}
                  >
                    {organizations.map((org) => (
                      <option key={org._id.toString()} value={org._id.toString()}>
                        {org.name}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Working Hours</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="maxHoursPerDay"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Hours Per Day</FormLabel>
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
              name="maxHoursPerWeek"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Hours Per Week</FormLabel>
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

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Availability</h3>
          <div className="space-y-4">
            {weekDays.map((day, dayIndex) => (
              <Card key={day}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-medium">{day}</h4>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addTimeSlot(dayIndex)}
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Time Slot
                    </Button>
                  </div>
                  <div className="space-y-2">
                    {form.watch(`availability.${dayIndex}.timeSlots`)?.map((slot: { start: string; end: string }, slotIndex: number) => (
                      <div key={slotIndex} className="flex items-center gap-2">
                        <Input
                          type="time"
                          value={slot.start}
                          onChange={(e) => {
                            const availability = [...form.getValues('availability')];
                            availability[dayIndex].timeSlots[slotIndex].start = e.target.value;
                            form.setValue('availability', availability, { shouldValidate: true });
                          }}
                        />
                        <span>to</span>
                        <Input
                          type="time"
                          value={slot.end}
                          onChange={(e) => {
                            const availability = [...form.getValues('availability')];
                            availability[dayIndex].timeSlots[slotIndex].end = e.target.value;
                            form.setValue('availability', availability, { shouldValidate: true });
                          }}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTimeSlot(dayIndex, slotIndex)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {initialData ? 'Update' : 'Create'} Teacher
          </Button>
        </div>
      </form>
    </Form>
  );
}