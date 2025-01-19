"use client";

import { useState, useEffect } from "react";
import { Check, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useOrganizations } from "@/hooks/use-organizations";

interface SubjectSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
  organizationIds?: string[];
}

export function SubjectSelector({ 
  value, 
  onChange, 
  organizationIds = [] 
}: SubjectSelectorProps) {
  const [subjects, setSubjects] = useState<string[]>([]);
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
          // Extract subject names from the response
          return (data.subjects || []).map((subject: any) => subject.name);
        });

        const allSubjects = await Promise.all(subjectPromises);
        // Flatten and deduplicate subjects
        const uniqueSubjects = [...new Set(allSubjects.flat())];
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
  }, [organizationIds]);

  const handleAddSubject = async () => {
    if (!newSubject.trim() || organizationIds.length === 0) return;

    setIsLoading(true);
    try {
      // Ensure organization IDs are strings
      const validOrgIds = organizationIds.filter(id => id && typeof id === 'string');

      // Add subject to all selected organizations
      await Promise.all(validOrgIds.map(async (orgId) => {
        const response = await fetch(`/api/organizations/${orgId.toString()}/subjects`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newSubject })
        });
        
        if (!response.ok) {
          throw new Error(`Failed to add subject to organization ${orgId}`);
        }
      }));

      // Add to selected subjects
      onChange([...value, newSubject]);

      // Add to available subjects if not already present
      if (!subjects.includes(newSubject)) {
        setSubjects([...subjects, newSubject]);
      }

      setNewSubject("");
      setIsAdding(false);
    } catch (error) {
      console.error('Error adding subject to organizations:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {subjects.map((subject) => (
          <Button
            key={subject}
            type="button"
            variant={value.includes(subject) ? "default" : "outline"}
            size="sm"
            onClick={(e) => {
              e.preventDefault();
              onChange(
                value.includes(subject)
                  ? value.filter((x) => x !== subject)
                  : [...value, subject]
              );
            }}
            disabled={isLoading}
          >
            {value.includes(subject) && <Check className="mr-2 h-4 w-4" />}
            {subject}
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
    </div>
  );
} 