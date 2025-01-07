"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useTeacherStore } from "@/store/teacher-store";



interface TeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingTeacherId?: string;
}

const TeacherModal: React.FC<TeacherModalProps> = ({
  isOpen,
  onClose,
  editingTeacherId,
}) => {
  const { teachers, addTeacher, updateTeacher } = useTeacherStore();
  const [name, setName] = useState("");
  const [subjects, setSubjects] = useState(""); // comma-separated or however

  // If editing, find the teacher and load their data
  useEffect(() => {
    if (editingTeacherId) {
      const teacherToEdit = teachers.find((t) => t.id === editingTeacherId);
      if (teacherToEdit) {
        setName(teacherToEdit.name);
        setSubjects(teacherToEdit.subjects.join(", "));
      }
    } else {
      // Reset
      setName("");
      setSubjects("");
    }
  }, [editingTeacherId, teachers]);

  const handleSave = () => {
    // Build the teacher data
    const teacherData = {
      name,
      subjects: subjects.split(",").map((s) => s.trim()),
    };

    if (editingTeacherId) {
      // Update existing teacher
      updateTeacher(editingTeacherId, teacherData);
    } else {
      // Add new teacher
      addTeacher(teacherData);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[475px]">
        <DialogHeader>
          <DialogTitle>
            {editingTeacherId ? "Edit Teacher" : "Add New Teacher"}
          </DialogTitle>
        </DialogHeader>

        {/* Form Inputs */}
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="teacher-name">Name</Label>
            <Input
              id="teacher-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Teacher's Name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="teacher-subjects">Subjects (comma separated)</Label>
            <Textarea
              id="teacher-subjects"
              value={subjects}
              onChange={(e) => setSubjects(e.target.value)}
              placeholder="e.g. Math, Physics"
            />
          </div>

          {/* Availability fields, if needed */}
          {/* 
          <div className="space-y-2">
            <Label>Availability</Label>
            <div>
              Implementation depends on how you want to store availability
            </div>
          </div>
          */}
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {editingTeacherId ? "Update" : "Create"}
          </Button>
        </DialogFooter>

        <DialogClose />
      </DialogContent>
    </Dialog>
  );
};

export default TeacherModal;
