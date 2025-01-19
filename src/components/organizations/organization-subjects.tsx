import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, X } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { ISubject } from '@/lib/db/models/organization';

interface OrganizationSubjectsProps {
  organizationId: string;
}

export function OrganizationSubjects({ organizationId }: OrganizationSubjectsProps) {
  const [subjects, setSubjects] = useState<ISubject[]>([]);
  const [newSubject, setNewSubject] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`/api/organizations/${organizationId}/subjects`);
        if (!response.ok) throw new Error('Failed to fetch subjects');
        const data = await response.json();
        setSubjects(data.subjects || []);
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to load subjects',
          variant: 'destructive',
        });
        setSubjects([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (organizationId) {
      fetchSubjects();
    }
  }, [organizationId, toast]);

  // Add new subject
  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim()) return;

    try {
      const response = await fetch(`/api/organizations/${organizationId}/subjects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newSubject.trim(),
          color: '#3b82f6' // Default blue color
        }),
      });

      if (!response.ok) throw new Error('Failed to create subject');
      
      const createdSubject = await response.json();
      setSubjects(prev => [...prev, createdSubject]);
      setNewSubject('');
      
      toast({
        title: 'Success',
        description: 'Subject added successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add subject',
        variant: 'destructive',
      });
    }
  };

  // Delete subject
  const handleDeleteSubject = async (subjectId: string) => {
    try {
      const response = await fetch(`/api/organizations/${organizationId}/subjects/${subjectId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete subject');
      
      setSubjects(prev => prev.filter(subject => subject._id.toString() !== subjectId));
      
      toast({
        title: 'Success',
        description: 'Subject deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete subject',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col space-y-4">
        <h2 className="text-2xl font-bold tracking-tight">Subjects</h2>
        <p className="text-muted-foreground">
          Manage subjects for your organization. These subjects can be assigned to teachers and events.
        </p>
      </div>

      {/* Add Subject Form */}
      <form onSubmit={handleAddSubject} className="flex gap-2">
        <Input
          placeholder="Enter new subject name..."
          value={newSubject}
          onChange={(e) => setNewSubject(e.target.value)}
          className="max-w-sm"
        />
        <Button type="submit" disabled={!newSubject.trim()}>
          <Plus className="h-4 w-4 mr-2" />
          Add Subject
        </Button>
      </form>

      {/* Subjects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
        <AnimatePresence mode="popLayout">
          {subjects.map((subject) => (
            <motion.div
              key={subject._id.toString()}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              layout
            >
              <Card>
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: subject.color }}
                    />
                    <span className="font-medium">{subject.name}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteSubject(subject._id.toString())}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {subjects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No subjects added yet. Add your first subject above.</p>
        </div>
      )}
    </div>
  );
} 