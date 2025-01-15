"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useOrganizations } from "@/hooks/use-organizations";
import { SubjectSelector } from "@/components/teachers/subject-selector";
import { AvailabilityScheduler } from "@/components/teachers/availability-scheduler";
import { z } from "zod";
import { fetchWithAuth } from "@/lib/api/fetch-with-auth";
import { useUser } from '@auth0/nextjs-auth0/client';

interface TeacherFormData {
  name: string;
  email: string;
  phoneNumber: string;
  subjects: string[];
  role: string;
  maxHoursPerWeek: number;
  qualifications: string[];
  availability: {
    dayOfWeek: number;
    timeSlots: { start: string; end: string; }[];
  }[];
}

const teacherSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().optional(),
  subjects: z.array(z.string()),
  role: z.enum(["fulltime", "parttime", "substitute"]),
  maxHoursPerWeek: z.number().min(1).max(168),
  qualifications: z.array(z.string()),
  availability: z.array(z.object({
    dayOfWeek: z.number().min(0).max(6),
    timeSlots: z.array(z.object({
      start: z.string(),
      end: z.string()
    }))
  }))
});

export default function NewTeacherPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { currentOrg } = useOrganizations();
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<TeacherFormData>({
    name: "",
    email: "",
    phoneNumber: "",
    subjects: [],
    role: "fulltime",
    maxHoursPerWeek: 40,
    qualifications: [],
    availability: []
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrg) return;

    try {
      setLoading(true);
      const validatedData = teacherSchema.parse(formData);

      const response = await fetchWithAuth("/api/teachers", {
        method: "POST",
        user,
        body: JSON.stringify({
          ...validatedData,
          organizationId: currentOrg
        }),
      });

      if (!response.ok) throw new Error("Failed to create teacher");

      toast({
        title: "Success",
        children: "Teacher created successfully"
      });

      router.push("/teachers/settings");
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          variant: "destructive",
          title: "Validation Error",
          children: error.errors[0].message
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          children: "Failed to create teacher"
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Rest of the component remains the same...
} 