"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Plus, UserPlus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ITeacher } from "@/lib/db/interfaces";
import { TeacherForm, TeacherFormData } from "@/components/teachers/teacher-form";
import { TeacherCard } from "@/components/teachers/teacher-card";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { TeacherModal } from "@/components/calendar/teachers/teacher-modal";
import { Skeleton } from "@/components/ui/skeleton";

interface OrganizationTeachersProps {
  organizationId: string;
}

interface TeacherCardType {
  _id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  subjects: string[];
  status: 'active' | 'inactive' | 'substitute';
  color: string;
  maxHoursPerDay: number;
  maxHoursPerWeek: number;
  availability: {
    dayOfWeek: number;
    timeSlots: { start: string; end: string; }[];
  }[];
  preferences: {
    consecutiveHours: number;
    breakDuration: number;
    preferredDays: number[];
  };
  organizationId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export function OrganizationTeachers({ organizationId }: OrganizationTeachersProps) {
  const { toast } = useToast();
  const [teachers, setTeachers] = useState<ITeacher[]>([]);
  const [globalTeachers, setGlobalTeachers] = useState<ITeacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTeachers();
    fetchGlobalTeachers();
  }, [organizationId]);

  const fetchTeachers = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/organizations/${organizationId}/teachers`
      );
      if (response.ok) {
        const data = await response.json();
        setTeachers(data);
      }
    } catch (error) {
      console.error("Error fetching teachers:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch teachers"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGlobalTeachers = async () => {
    try {
      const response = await fetch("/api/teachers");
      if (response.ok) {
        const data = await response.json();
        setGlobalTeachers(data);
      }
    } catch (error) {
      console.error("Error fetching global teachers:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch global teachers"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeacher = async (data: TeacherFormData) => {
    try {
      const response = await fetch(
        `/api/organizations/${organizationId}/teachers`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create teacher");
      }

      toast({
        title: "Success",
        description: "Teacher created successfully",
      });

      fetchTeachers();
      setIsDialogOpen(false);
    } catch (error) {
      console.error("Error creating teacher:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create teacher"
      });
    }
  };

  const handleAssignTeacher = async (teacherId: string) => {
    try {
      const response = await fetch(
        `/api/organizations/${organizationId}/teachers`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ teacherId }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to assign teacher");
      }

      toast({
        title: "Success",
        description: "Teacher assigned successfully",
      });

      fetchTeachers();
    } catch (error) {
      console.error("Error assigning teacher:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to assign teacher",
      });
    }
  };

  const handleRemoveTeacher = async (teacherId: string) => {
    try {
      const response = await fetch(
        `/api/organizations/${organizationId}/teachers/${teacherId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to remove teacher");
      }

      toast({
        title: "Success",
        description: "Teacher removed successfully",
      });

      fetchTeachers();
    } catch (error) {
      console.error("Error removing teacher:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to remove teacher",
      });
    }
  };

  const convertTeacher = (teacher: any): TeacherCardType => ({
    _id: teacher._id.toString(),
    name: teacher.name,
    email: teacher.email,
    phoneNumber: teacher.phoneNumber,
    subjects: teacher.subjects,
    status: teacher.organizationTeacherStatus || teacher.status || 'active',
    color: teacher.color,
    maxHoursPerDay: teacher.maxHoursPerDay,
    maxHoursPerWeek: teacher.maxHoursPerWeek,
    availability: teacher.availability,
    preferences: teacher.preferences,
    organizationId: organizationId,
    createdBy: teacher.createdBy,
    createdAt: new Date(teacher.createdAt).toISOString(),
    updatedAt: new Date(teacher.updatedAt).toISOString()
  });

  const filteredTeachers = teachers.filter(teacher => 
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.subjects.some(subject => 
      subject.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-x-2">
          <Button onClick={() => setIsDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            New Teacher
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <UserPlus className="mr-2 h-4 w-4" />
                Assign Teacher
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {globalTeachers
                .filter(
                  (t) => !teachers.some((ot) => ot._id.toString() === t._id.toString())
                )
                .map((teacher) => (
                  <DropdownMenuItem
                    key={teacher._id.toString()}
                    onClick={() => handleAssignTeacher(teacher._id.toString())}
                  >
                    {teacher.name}
                  </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="relative flex-1 max-w-sm ml-4">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search teachers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-4 rounded-lg border">
              <div className="space-y-3">
                <Skeleton className="h-4 w-[250px]" />
                <Skeleton className="h-4 w-[200px]" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTeachers.length === 0 ? (
            <div className="col-span-full text-center py-8 text-gray-500">
              {searchTerm ? "No teachers found matching your search" : "No teachers added yet"}
            </div>
          ) : (
            filteredTeachers.map((teacher) => (
              <TeacherCard 
                key={teacher._id.toString()} 
                teacher={convertTeacher(teacher)} 
                onUpdate={fetchTeachers}
              />
            ))
          )}
        </div>
      )}

      {isDialogOpen && (
        <TeacherModal
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          organizationId={organizationId}
          onSuccess={fetchTeachers}
        />
      )}
    </div>
  );
} 