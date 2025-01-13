"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { ColorPicker } from "@/components/ui/color-picker";
import { Plus, Pencil, Trash2 } from 'lucide-react';

interface Subject {
  id: string;
  name: string;
  color: string;
  description?: string;
}

interface SubjectManagerProps {
  organizationId: string;
}

const defaultColors = [
  { label: 'Blue', value: '#2563eb' },
  { label: 'Green', value: '#16a34a' },
  { label: 'Red', value: '#dc2626' },
  { label: 'Purple', value: '#9333ea' },
  { label: 'Yellow', value: '#ca8a04' },
  { label: 'Orange', value: '#ea580c' },
  { label: 'Pink', value: '#db2777' },
  { label: 'Cyan', value: '#0891b2' },
];

export function SubjectManager({ organizationId }: SubjectManagerProps) {
  const { toast } = useToast();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    color: defaultColors[0].value,
    description: ''
  });

  useEffect(() => {
    if (organizationId) {
      fetchSubjects();
    }
  }, [organizationId]);

  const fetchSubjects = async () => {
    try {
      const response = await fetch(`/api/admin/organizations/${organizationId}/subjects`);
      if (!response.ok) throw new Error('Failed to fetch subjects');
      const data = await response.json();
      setSubjects(data.subjects);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        children: "Failed to load subjects"
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingSubject
        ? `/api/admin/organizations/${organizationId}/subjects/${editingSubject.id}`
        : `/api/admin/organizations/${organizationId}/subjects`;

      const response = await fetch(url, {
        method: editingSubject ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save subject');

      toast({
        title: "Success",
        children: `Subject ${editingSubject ? 'updated' : 'created'} successfully`
      });

      // Reset form and refresh subjects
      setFormData({ name: '', color: defaultColors[0].value, description: '' });
      setEditingSubject(null);
      fetchSubjects();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        children: "Failed to save subject"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (subjectId: string) => {
    if (!confirm('Are you sure you want to delete this subject?')) return;

    try {
      const response = await fetch(
        `/api/admin/organizations/${organizationId}/subjects/${subjectId}`,
        { method: 'DELETE' }
      );

      if (!response.ok) throw new Error('Failed to delete subject');

      toast({
        title: "Success",
        children: "Subject deleted successfully"
      });

      fetchSubjects();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        children: "Failed to delete subject"
      });
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{editingSubject ? 'Edit' : 'Add'} Subject</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Subject Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Color</Label>
              <ColorPicker
                value={formData.color}
                onChange={(color) => setFormData({ ...formData, color })}
                colors={defaultColors}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="flex justify-between">
              {editingSubject && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setEditingSubject(null);
                    setFormData({ name: '', color: defaultColors[0].value, description: '' });
                  }}
                >
                  Cancel
                </Button>
              )}
              <Button type="submit" disabled={loading}>
                {loading ? 'Saving...' : (editingSubject ? 'Update' : 'Add')} Subject
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Subjects</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {subjects.map((subject) => (
              <div
                key={subject.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: subject.color }}
                  />
                  <span>{subject.name}</span>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setEditingSubject(subject);
                      setFormData({
                        name: subject.name,
                        color: subject.color,
                        description: subject.description || ''
                      });
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(subject.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 