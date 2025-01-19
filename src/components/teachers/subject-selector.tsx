"use client";

import { useState, useEffect } from "react";
import { Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOrganizations } from "@/hooks/use-organizations";

interface Subject {
  _id: string;
  name: string;
  color: string;
  description?: string;
  organizationId: string;
}

interface SubjectSelectorProps {
  value: Array<{
    organizationId: string;
    subjectId: string;
  }>;
  onChange: (value: Array<{
    organizationId: string;
    subjectId: string;
  }>) => void;
  organizationIds?: string[];
}

export function SubjectSelector({ 
  value, 
  onChange, 
  organizationIds = [] 
}: SubjectSelectorProps) {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [newSubject, setNewSubject] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchSubjects = async () => {
      setIsLoading(true);
      try {
        // Ensure organization IDs are strings and valid
        const validOrgIds = organizationIds.filter(id => id && typeof id === 'string');
        
        // Fetch subjects from all selected organizations
        const subjectPromises = validOrgIds.map(async (orgId) => {
          const response = await fetch(`/api/organizations/${orgId.toString()}/subjects`);
          if (!response.ok) return [];
          const data = await response.json();
          return data.subjects.map((subject: Subject) => ({
            ...subject,
            organizationId: orgId
          })) || [];
        });

        const allSubjectsArrays = await Promise.all(subjectPromises);
        // Flatten and deduplicate subjects by _id
        const uniqueSubjects = Array.from(
          new Map(
            allSubjectsArrays.flat().map(subject => [subject._id, subject])
          ).values()
        );
        setSubjects(uniqueSubjects);
      } catch (error) {
        console.error('Error fetching subjects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (organizationIds.length > 0) {
      fetchSubjects();
    } else {
      setSubjects([]); // Reset subjects when no organizations are selected
    }
  }, [JSON.stringify(organizationIds)]); // Use JSON.stringify to compare array values instead of references

  const handleAddSubject = async () => {
    if (!newSubject.trim() || organizationIds.length === 0) return;

    setIsLoading(true);
    try {
      // Add subject to the first selected organization
      const orgId = organizationIds[0];
      const response = await fetch(`/api/organizations/${orgId}/subjects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name: newSubject,
          color: '#' + Math.floor(Math.random()*16777215).toString(16) // Random color
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to add subject to organization ${orgId}`);
      }

      const newSubjectData = await response.json();
      
      // Add to selected subjects using the new subject's ID
      onChange([...value, {
        organizationId: orgId,
        subjectId: newSubjectData._id
      }]);

      // Add to available subjects
      setSubjects(prev => [...prev, {
        ...newSubjectData,
        organizationId: orgId
      }]);

      setNewSubject("");
      setIsAdding(false);
    } catch (error) {
      console.error('Error adding subject to organization:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {subjects.map((subject) => (
          <Button
            key={subject._id}
            type="button"
            variant={value.some(v => v.subjectId === subject._id && v.organizationId === subject.organizationId) ? "default" : "outline"}
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              const isSelected = value.some(v => v.subjectId === subject._id && v.organizationId === subject.organizationId);
              onChange(
                isSelected
                  ? value.filter((x) => !(x.subjectId === subject._id && x.organizationId === subject.organizationId))
                  : [...value, { organizationId: subject.organizationId, subjectId: subject._id }]
              );
            }}
            disabled={isLoading}
            style={{
              backgroundColor: value.some(v => v.subjectId === subject._id && v.organizationId === subject.organizationId) ? subject.color : undefined,
              borderColor: subject.color
            }}
          >
            {value.some(v => v.subjectId === subject._id && v.organizationId === subject.organizationId) && <Check className="mr-2 h-4 w-4" />}
            {subject.name}
          </Button>
        ))}
        {organizationIds.length > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsAdding(true)}
            disabled={isLoading}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Subject
          </Button>
        )}
      </div>

      {isAdding && (
        <div className="flex gap-2">
          <Input
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            placeholder="Enter new subject"
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="button" onClick={handleAddSubject} disabled={isLoading}>
            Add
          </Button>
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => setIsAdding(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
        </div>
      )}

      {organizationIds.length === 0 && (
        <div className="text-sm text-muted-foreground">
          Please select an organization to view or add subjects
        </div>
      )}
    </div>
  );
} 