// src/components/teachers/teacher-form.tsx
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
import { SubjectSelector } from "@/components/teachers/subject-selector";
import { ColorPicker } from "@/components/ui/color-picker";
import { Separator } from "@/components/ui/separator";
import { Plus, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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
  color: z.string(),
  maxHoursPerDay: z.number().min(1, "Must be at least 1 hour").max(24, "Cannot exceed 24 hours"),
  maxHoursPerWeek: z.number().min(1, "Must be at least 1 hour").max(168, "Cannot exceed 168 hours"),
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
  const form = useForm({
    resolver: zodResolver(teacherSchema),
    defaultValues: initialData || {
      name: "",
      email: "",
      phoneNumber: "",
      subjects: [],
      color: "#000000",
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
      day.timeSlots = day.timeSlots.filter((_, index) => index !== slotIndex);
      form.setValue('availability', availability, { shouldValidate: true });
    }
  };

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
            name="subjects"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subjects</FormLabel>
                <FormControl>
                  <SubjectSelector
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
                        <FormField
                          control={form.control}
                          name={`availability.${dayIndex}.timeSlots.${slotIndex}.start`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input type="time" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <span>to</span>
                        <FormField
                          control={form.control}
                          name={`availability.${dayIndex}.timeSlots.${slotIndex}.end`}
                          render={({ field }) => (
                            <FormItem className="flex-1">
                              <FormControl>
                                <Input type="time" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
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

        <Separator />

        <div className="space-y-4">
          <h3 className="text-lg font-medium">Preferences</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="preferences.consecutiveHours"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Consecutive Hours</FormLabel>
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
              name="preferences.breakDuration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Break Duration (minutes)</FormLabel>
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
            <>{initialData ? 'Update' : 'Create'} Teacher</>
          )}
        </Button>
      </form>
    </Form>
  );
}