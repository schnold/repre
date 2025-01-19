// FILE: src/app/(app)/teachers/page.tsx
"use client";

import { useEffect, useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useOrganizations } from '@/hooks/use-organizations';
import { TeacherCard } from '@/components/teachers/teacher-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TeacherModal } from "@/components/calendar/teachers/teacher-modal";
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { Search, Plus, Filter } from 'lucide-react';
import { fetchWithAuth } from '@/lib/api/fetch-with-auth';
import { Types } from 'mongoose';

interface Teacher {
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

export default function TeachersPage() {
  const { user, isLoading: userLoading } = useUser();
  const { currentOrg, loading: orgLoading } = useOrganizations();
  const router = useRouter();
  const { toast } = useToast();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!userLoading) {
      fetchTeachers();
    }
  }, [userLoading]);

  const fetchTeachers = async () => {
    try {
      setIsLoading(true);
      if (!user) {
        console.log('No user data available');
        toast({
          variant: "destructive",
          title: "Error",
          children: "Not authenticated"
        });
        return;
      }

      console.log('Fetching all teachers');
      const response = await fetchWithAuth(`/api/teachers`, { user });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response from API:', errorData);
        throw new Error(errorData.message || 'Failed to fetch teachers');
      }
      
      const data = await response.json();
      console.log('Fetched teachers:', data);
      setTeachers(data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      toast({
        variant: "destructive",
        title: "Error loading teachers",
        children: error instanceof Error ? error.message : "Failed to load teachers"
      });
      setTeachers([]); // Reset teachers on error
    } finally {
      setIsLoading(false);
    }
  };

  const filteredTeachers = teachers.filter(teacher => 
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.subjects.some(subject => 
      subject.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const handleTeacherAdded = () => {
    console.log('Teacher added, refreshing list...');
    fetchTeachers();
  };

  const handleAddTeacher = () => {
    if (!currentOrg) {
      toast({
        variant: "destructive",
        title: "Error",
        children: "Please select an organization first"
      });
      return;
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  if (userLoading || orgLoading) {
    return (
      <div className="container mx-auto py-6 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
      </div>
    );
  }

  if (!currentOrg) {
    return (
      <div className="container mx-auto py-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Loading Organization...</h1>
        <p className="text-gray-600">Please wait while we load your organization data.</p>
      </div>
    );
  }

  const orgId = typeof currentOrg._id === 'string' ? currentOrg._id : currentOrg._id.toString();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Teachers</h1>
        <Button type="button" onClick={handleAddTeacher}>
          <Plus className="mr-2 h-4 w-4" />
          Add Teacher
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search teachers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filters
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? (
          <div className="col-span-full flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
          </div>
        ) : filteredTeachers.length === 0 ? (
          <div className="col-span-full text-center py-8 text-gray-500">
            {searchTerm ? "No teachers found matching your search" : "No teachers added yet"}
          </div>
        ) : (
          filteredTeachers.map((teacher) => (
            <TeacherCard key={teacher._id} teacher={teacher} onUpdate={fetchTeachers} />
          ))
        )}
      </div>

      {isModalOpen && (
        <TeacherModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSuccess={handleTeacherAdded}
        />
      )}
    </div>
  );
}
