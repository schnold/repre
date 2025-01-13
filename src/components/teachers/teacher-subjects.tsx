"use client";

import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { Plus, X } from 'lucide-react';
import type { TeacherListItem } from '@/types/teacher';

interface TeacherSubjectsProps {
  organizationId: string;
}

interface Subject {
  id: string;
  name: string;
  color: string;
}

export function TeacherSubjects({ organizationId }: TeacherSubjectsProps) {
  const { toast } = useToast();
  const [teachers, setTeachers] = useState<TeacherListItem[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchTeachers(),
      fetchSubjects()
    ]).finally(() => setLoading(false));
  }, [organizationId]);

  useEffect(() => {
    if (selectedTeacher) {
      fetchTeacherSubjects(selectedTeacher);
    }
  }, [selectedTeacher]);

  const fetchTeachers = async () => {
    try {
      const response = await fetch(`/api/teachers?organizationId=${organizationId}`);
      if (!response.ok) throw new Error('Failed to fetch teachers');
      const data = await response.json();
      setTeachers(data);
      if (data.length > 0) {
        setSelectedTeacher(data[0].id);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        children: "Failed to load teachers"
      });
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await fetch(`/api/subjects?organizationId=${organizationId}`);
      if (!response.ok) throw new Error('Failed to fetch subjects');
      const data = await response.json();
      setSubjects(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        children: "Failed to load subjects"
      });
    }
  };

  const fetchTeacherSubjects = async (teacherId: string) => {
    try {
      const response = await fetch(`/api/teachers/${teacherId}/subjects`);
      if (!response.ok) throw new Error('Failed to fetch teacher subjects');
      const data = await response.json();
      setSelectedSubjects(data.subjects);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        children: "Failed to load teacher subjects"
      });
    }
  };

  const handleAddSubject = async (subjectId: string) => {
    if (!selectedTeacher) return;

    try {
      const response = await fetch(`/api/teachers/${selectedTeacher}/subjects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subjectId }),
      });

      if (!response.ok) throw new Error('Failed to add subject');

      setSelectedSubjects(prev => [...prev, subjectId]);
      toast({
        title: "Success",
        children: "Subject added successfully"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        children: "Failed to add subject"
      });
    }
  };

  const handleRemoveSubject = async (subjectId: string) => {
    if (!selectedTeacher) return;

    try {
      const response = await fetch(`/api/teachers/${selectedTeacher}/subjects/${subjectId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to remove subject');

      setSelectedSubjects(prev => prev.filter(id => id !== subjectId));
      toast({
        title: "Success",
        children: "Subject removed successfully"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        children: "Failed to remove subject"
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Teacher Subjects</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Select
          value={selectedTeacher || ''}
          onValueChange={setSelectedTeacher}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a teacher" />
          </SelectTrigger>
          <SelectContent>
            {teachers.map((teacher) => (
              <SelectItem key={teacher.id} value={teacher.id}>
                {teacher.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selectedTeacher && (
          <>
            <div className="space-y-4">
              <h3 className="text-sm font-medium">Assigned Subjects</h3>
              <div className="flex flex-wrap gap-2">
                {selectedSubjects.map((subjectId) => {
                  const subject = subjects.find(s => s.id === subjectId);
                  if (!subject) return null;

                  return (
                    <Badge
                      key={subject.id}
                      style={{ backgroundColor: subject.color }}
                      className="flex items-center gap-1"
                    >
                      {subject.name}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-transparent"
                        onClick={() => handleRemoveSubject(subject.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  );
                })}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium">Available Subjects</h3>
              <div className="flex flex-wrap gap-2">
                {subjects
                  .filter(subject => !selectedSubjects.includes(subject.id))
                  .map((subject) => (
                    <Badge
                      key={subject.id}
                      variant="outline"
                      className="flex items-center gap-1 cursor-pointer"
                      onClick={() => handleAddSubject(subject.id)}
                    >
                      {subject.name}
                      <Plus className="h-3 w-3" />
                    </Badge>
                  ))}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
} 