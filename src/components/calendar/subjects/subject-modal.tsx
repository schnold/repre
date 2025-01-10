// src/components/calendar/subjects/subject-modal.tsx
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useCalendarStore } from '@/store/calendar-store';
import { Trash2, Plus } from 'lucide-react';
import { PASTEL_COLORS } from '@/lib/utils/color-helpers';

interface SubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SubjectModal({ isOpen, onClose }: SubjectModalProps) {
  const { subjects, addSubject, updateSubject, deleteSubject } = useCalendarStore();
  const [newSubject, setNewSubject] = useState({
    name: '',
    color: PASTEL_COLORS[0]
  });

  const handleAddSubject = () => {
    if (newSubject.name.trim()) {
      addSubject({
        name: newSubject.name,
        color: newSubject.color
      });
      setNewSubject({ name: '', color: PASTEL_COLORS[0] });
    }
  };

  const handleUpdateColor = (id: string, color: string) => {
    updateSubject(id, { color });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Manage Subjects</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {/* Add new subject form */}
          <div className="flex items-end gap-2">
            <div className="grid gap-2 flex-1">
              <Label htmlFor="new-subject">New Subject</Label>
              <Input
                id="new-subject"
                value={newSubject.name}
                onChange={(e) => setNewSubject({ ...newSubject, name: e.target.value })}
                placeholder="Enter subject name"
              />
            </div>
            <Input
              type="color"
              value={newSubject.color}
              onChange={(e) => setNewSubject({ ...newSubject, color: e.target.value })}
              className="w-20"
            />
            <Button onClick={handleAddSubject} size="icon">
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {/* Existing subjects list */}
          <div className="space-y-2">
            <Label>Existing Subjects</Label>
            {subjects.map((subject) => (
              <div
                key={subject.id}
                className="flex items-center gap-2 p-2 rounded-md border bg-background"
              >
                <span className="flex-1">{subject.name}</span>
                <Input
                  type="color"
                  value={subject.color}
                  onChange={(e) => handleUpdateColor(subject.id, e.target.value)}
                  className="w-20"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteSubject(subject.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}