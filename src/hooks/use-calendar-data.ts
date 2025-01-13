"use client";

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';

export interface Teacher {
  id: string;
  name: string;
  email: string;
  color: string;
}

export interface Subject {
  id: string;
  name: string;
  color: string;
  teacherIds: string[];
}

export interface CalendarData {
  teachers: Teacher[];
  subjects: Subject[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useCalendarData(organizationId?: string): CalendarData {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch teachers and subjects in parallel
      const [teachersRes, subjectsRes] = await Promise.all([
        fetch(`/api/teachers?organizationId=${organizationId}`),
        fetch(`/api/subjects?organizationId=${organizationId}`)
      ]);

      if (!teachersRes.ok || !subjectsRes.ok) {
        throw new Error('Failed to fetch calendar data');
      }

      const teachersData = await teachersRes.json();
      const subjectsData = await subjectsRes.json();

      setTeachers(teachersData);
      setSubjects(subjectsData);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch calendar data';
      setError(message);
      toast({
        variant: "destructive",
        title: "Error",
        children: message
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (organizationId) {
      fetchData();
    }
  }, [organizationId]);

  return {
    teachers,
    subjects,
    isLoading,
    error,
    refetch: fetchData
  };
} 