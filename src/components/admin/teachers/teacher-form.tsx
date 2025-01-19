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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ITeacher, IOrganization } from "@/lib/db/interfaces";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

const teacherSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().optional(),
  subjects: z.array(z.string()).min(1, "At least one subject is required"),
  status: z.enum(["active", "inactive", "substitute"]),
  color: z.string(),
  organizationIds: z.array(z.string()).min(1, "At least one organization is required"),
  maxHoursPerDay: z.number().min(1),
  maxHoursPerWeek: z.number().min(1),
  preferences: z.object({
    consecutiveHours: z.number().min(1),
    breakDuration: z.number().min(0),
    preferredDays: z.array(z.number()),
  }),
});

type TeacherFormValues = z.infer<typeof teacherSchema>;

interface TeacherFormProps {
  onSubmit: (data: TeacherFormValues) => Promise<void>;
  initialData?: ITeacher;
  isLoading?: boolean;
}

export function TeacherForm({ onSubmit, initialData, isLoading }: TeacherFormProps) {
  const { toast } = useToast();
  const [organizations, setOrganizations] = useState<IOrganization[]>([]);
  const [loadingOrgs, setLoadingOrgs] = useState(true);

  const form = useForm<TeacherFormValues>({
    resolver: zodResolver(teacherSchema),
    defaultValues: initialData ? {
      ...initialData,
      organizationIds: []
    } : {
      name: "",
      email: "",
      phoneNumber: "",
      subjects: [],
      status: "active",
      color: "#000000",
      organizationIds: [],
      maxHoursPerDay: 8,
      maxHoursPerWeek: 40,
      preferences: {
        consecutiveHours: 4,
        breakDuration: 30,
        preferredDays: [],
      },
    },
  });

  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        setLoadingOrgs(true);
        const response = await fetch('/api/organizations');
        if (!response.ok) throw new Error('Failed to fetch organizations');
        const data = await response.json();
        setOrganizations(data);

        // If editing, fetch the teacher's organizations
        if (initialData?._id) {
          const teacherOrgsResponse = await fetch(`/api/teachers/${initialData._id}/organizations`);
          if (!teacherOrgsResponse.ok) throw new Error('Failed to fetch teacher organizations');
          const teacherOrgs = await teacherOrgsResponse.json();
          form.setValue('organizationIds', teacherOrgs.map((org: IOrganization) => org._id.toString()));
        }
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
  }, [toast, initialData, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
              <FormLabel>Phone Number</FormLabel>
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
                    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
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
              <FormDescription>
                Hold Ctrl/Cmd to select multiple organizations
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {initialData ? 'Update' : 'Create'} Teacher
          </Button>
        </div>
      </form>
    </Form>
  );
} 