import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { ISchoolClass } from '@/lib/db/models/organization';
import { Types } from 'mongoose';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SchoolClassesManagerProps {
  classes: ISchoolClass[];
  onChange: (classes: ISchoolClass[]) => void;
}

export function SchoolClassesManager({ classes, onChange }: SchoolClassesManagerProps) {
  const [newClassName, setNewClassName] = useState('');
  const [newGrade, setNewGrade] = useState('');
  const [newSection, setNewSection] = useState('');

  const handleAddClass = () => {
    if (!newClassName.trim() || !newGrade) return;

    const newClass = {
      _id: new Types.ObjectId(),
      name: newClassName.trim(),
      grade: parseInt(newGrade),
      section: newSection.trim() || undefined,
    };

    // Add new class and sort by grade and name
    const updatedClasses = [...classes, newClass].sort((a, b) => {
      if (a.grade !== b.grade) return a.grade - b.grade;
      return a.name.localeCompare(b.name);
    });

    onChange(updatedClasses);
    setNewClassName('');
    setNewGrade('');
    setNewSection('');
  };

  const handleRemoveClass = (classId: string) => {
    onChange(classes.filter(c => c._id.toString() !== classId));
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-1.5">
        <Label>School Classes</Label>
        <div className="flex flex-wrap gap-2 mb-4">
          {classes.map((schoolClass) => (
            <Badge
              key={schoolClass._id.toString()}
              variant="secondary"
              className="flex items-center gap-1 px-3 py-1"
            >
              <span>
                {schoolClass.name} (Grade {schoolClass.grade}
                {schoolClass.section && ` - ${schoolClass.section}`})
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={() => handleRemoveClass(schoolClass._id.toString())}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
          {classes.length === 0 && (
            <p className="text-sm text-muted-foreground">No classes added yet.</p>
          )}
        </div>
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder="Class name"
            value={newClassName}
            onChange={(e) => setNewClassName(e.target.value)}
          />
        </div>
        <Select
          value={newGrade}
          onValueChange={setNewGrade}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Grade" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 13 }, (_, i) => (
              <SelectItem key={i} value={i.toString()}>
                Grade {i}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          placeholder="Section (optional)"
          value={newSection}
          onChange={(e) => setNewSection(e.target.value)}
          className="w-[120px]"
        />
        <Button
          onClick={handleAddClass}
          disabled={!newClassName.trim() || !newGrade}
          size="icon"
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
} 