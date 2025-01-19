"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Plus, UserMinus } from "lucide-react";

interface Teacher {
  _id: string;
  name: string;
  email: string;
  status: string;
}

interface OrganizationTeachersProps {
  organizationId: string;
}

export function OrganizationTeachers({ organizationId }: OrganizationTeachersProps) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [availableTeachers, setAvailableTeachers] = useState<Teacher[]>([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [isRemoving, setIsRemoving] = useState<{ [key: string]: boolean }>({});
  const { toast } = useToast();

  // Fetch teachers and available teachers
  const fetchTeachers = async () => {
    try {
      setIsLoading(true);
      // Fetch teachers assigned to this organization
      const orgTeachersRes = await fetch(`/api/organizations/${organizationId}/teachers`);
      if (!orgTeachersRes.ok) throw new Error('Failed to fetch organization teachers');
      const orgTeachers = await orgTeachersRes.json();
      setTeachers(orgTeachers);

      // Fetch all teachers to find available ones
      const allTeachersRes = await fetch('/api/teachers');
      if (!allTeachersRes.ok) throw new Error('Failed to fetch all teachers');
      const allTeachers = await allTeachersRes.json();
      
      // Filter out teachers already in the organization
      const orgTeacherIds = new Set(orgTeachers.map((t: Teacher) => t._id));
      const available = allTeachers.filter((t: Teacher) => !orgTeacherIds.has(t._id));
      setAvailableTeachers(available);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load teachers",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, [organizationId]);

  const addTeacher = async () => {
    if (!selectedTeacherId) return;

    try {
      setIsAdding(true);
      const response = await fetch(`/api/organizations/${organizationId}/teachers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teacherId: selectedTeacherId }),
      });

      if (!response.ok) throw new Error('Failed to add teacher');

      toast({
        title: "Success",
        description: "Teacher added to organization",
      });

      setSelectedTeacherId("");
      fetchTeachers();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to add teacher",
      });
    } finally {
      setIsAdding(false);
    }
  };

  const removeTeacher = async (teacherId: string) => {
    try {
      setIsRemoving(prev => ({ ...prev, [teacherId]: true }));
      const response = await fetch(
        `/api/organizations/${organizationId}/teachers?teacherId=${teacherId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) throw new Error('Failed to remove teacher');

      toast({
        title: "Success",
        description: "Teacher removed from organization",
      });

      fetchTeachers();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to remove teacher",
      });
    } finally {
      setIsRemoving(prev => ({ ...prev, [teacherId]: false }));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Teachers</CardTitle>
        <CardDescription>Manage teachers in this organization</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Add Teacher Section */}
          <div className="flex items-end gap-4">
            <div className="flex-1">
              <Select
                value={selectedTeacherId}
                onValueChange={setSelectedTeacherId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a teacher to add" />
                </SelectTrigger>
                <SelectContent>
                  {availableTeachers.map((teacher) => (
                    <SelectItem key={teacher._id} value={teacher._id}>
                      {teacher.name} ({teacher.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button
              onClick={addTeacher}
              disabled={!selectedTeacherId || isAdding}
            >
              {isAdding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Plus className="mr-2 h-4 w-4" />
              Add Teacher
            </Button>
          </div>

          {/* Teachers List */}
          <div className="space-y-4">
            {teachers.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No teachers assigned to this organization yet.
              </p>
            ) : (
              teachers.map((teacher) => (
                <div
                  key={teacher._id}
                  className="flex items-center justify-between rounded-lg border p-4"
                >
                  <div>
                    <h4 className="font-medium">{teacher.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {teacher.email}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => removeTeacher(teacher._id)}
                    disabled={isRemoving[teacher._id]}
                  >
                    {isRemoving[teacher._id] ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <UserMinus className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 