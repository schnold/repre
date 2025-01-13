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

interface TeacherListProps {
  organizationId: string;
}

export function TeacherList({ organizationId }: TeacherListProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [teachers, setTeachers] = useState<TeacherListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTeachers();
  }, [organizationId]);

  const fetchTeachers = async () => {
    try {
      const response = await fetch(`/api/teachers?organizationId=${organizationId}`);
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
      const response = await fetch(`/api/teachers/${teacherId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (!response.ok) throw new Error('Failed to update status');

      setTeachers(prev => 
        prev.map(teacher => 
          teacher.id === teacherId 
            ? { ...teacher, status } 
            : teacher
        )
      );

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
    teacher.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'substitute': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search teachers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button onClick={() => router.push('/teachers/new')}>
          <Plus className="mr-2 h-4 w-4" />
          Add Teacher
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Subjects</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTeachers.map((teacher) => (
              <TableRow key={teacher.id}>
                <TableCell>{teacher.name}</TableCell>
                <TableCell>{teacher.email}</TableCell>
                <TableCell className="capitalize">{teacher.role}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {teacher.subjects.map((subject) => (
                      <Badge key={subject} variant="secondary">
                        {subject}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={cn(getStatusColor(teacher.status))}>
                    {teacher.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => router.push(`/teachers/${teacher.id}`)}
                      >
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStatusChange(teacher.id, 'active')}
                      >
                        Set Active
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStatusChange(teacher.id, 'inactive')}
                      >
                        Set Inactive
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleStatusChange(teacher.id, 'substitute')}
                      >
                        Set as Substitute
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 