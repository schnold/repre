"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Plus, Search, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TeacherListItem } from '@/types/teacher';
import { cn } from "@/lib/utils";
import { TeacherModal } from "@/components/calendar/teachers/teacher-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { fetchWithAuth } from "@/lib/api/fetch-with-auth";
import { useUser } from "@auth0/nextjs-auth0/client";

interface TeacherListProps {
  organizationId: string;
}

interface Teacher {
  _id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive' | 'substitute';
  subjects: string[];
}

export function TeacherList({ organizationId }: TeacherListProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { user } = useUser();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchTeachers();
  }, [organizationId]);

  const fetchTeachers = async () => {
    try {
      if (!user) return;
      const response = await fetchWithAuth(`/api/organizations/${organizationId}/teachers`, { user });
      if (!response.ok) throw new Error('Failed to fetch teachers');
      const data = await response.json();
      setTeachers(data);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        children: "Failed to load teachers"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (teacherId: string, status: 'active' | 'inactive' | 'substitute') => {
    try {
      if (!user) return;
      const response = await fetchWithAuth(`/api/organizations/${organizationId}/teachers/${teacherId}/status`, {
        method: 'PATCH',
        user,
        body: JSON.stringify({ status })
      });

      if (!response.ok) throw new Error('Failed to update teacher status');
      
      setTeachers(prev => prev.map(teacher => 
        teacher._id === teacherId ? { ...teacher, status } : teacher
      ));

      toast({
        title: "Success",
        children: "Teacher status updated"
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        children: "Failed to update teacher status"
      });
    }
  };

  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.subjects.some(subject =>
      subject.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="Search teachers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Teacher
        </Button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div className="grid gap-4">
          {filteredTeachers.map((teacher) => (
            <Card key={teacher._id}>
              <CardHeader>
                <CardTitle>{teacher.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">{teacher.email}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {teacher.subjects.map((subject) => (
                        <span
                          key={subject}
                          className="bg-secondary text-secondary-foreground px-2 py-1 rounded-md text-sm"
                        >
                          {subject}
                        </span>
                      ))}
                    </div>
                  </div>
                  <RadioGroup
                    defaultValue={teacher.status || 'active'}
                    onValueChange={(value) => handleStatusChange(teacher._id, value as 'active' | 'inactive' | 'substitute')}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="active" id={`active-${teacher._id}`} />
                      <Label htmlFor={`active-${teacher._id}`}>Active</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="inactive" id={`inactive-${teacher._id}`} />
                      <Label htmlFor={`inactive-${teacher._id}`}>Inactive</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="substitute" id={`substitute-${teacher._id}`} />
                      <Label htmlFor={`substitute-${teacher._id}`}>Substitute</Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {isModalOpen && (
        <TeacherModal
          isOpen={isModalOpen}
          organizationId={organizationId}
          onClose={() => {
            setIsModalOpen(false);
            fetchTeachers();
          }}
        />
      )}
    </div>
  );
} 