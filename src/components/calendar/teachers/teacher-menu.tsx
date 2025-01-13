"use client";

import React, { useState } from "react";
import { useTeacherStore } from "@/store/teacher-store";
import { Button } from "@/components/ui/button";
import { TeacherModal } from "./teacher-modal";
import { Edit, Trash2, Plus } from "lucide-react";
import { useOrganizations } from "@/hooks/use-organizations";

export default function TeacherMenu() {
  const { teachers, deleteTeacher } = useTeacherStore();
  const { currentOrg } = useOrganizations();

  // State to open/close the TeacherModal
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Which teacher are we editing? null means we're adding a new teacher
  const [editingTeacherId, setEditingTeacherId] = useState<string | null>(null);

  const handleAddTeacher = () => {
    setEditingTeacherId(null); // not editing an existing teacher
    setIsModalOpen(true);
  };

  const handleEditTeacher = (id: string) => {
    setEditingTeacherId(id);
    setIsModalOpen(true);
  };

  const handleDeleteTeacher = (id: string) => {
    const confirmed = window.confirm("Are you sure you want to delete this teacher?");
    if (confirmed) {
      deleteTeacher(id);
    }
  };

  return (
    <div className="h-full flex flex-col border-r p-4 space-y-4 bg-muted/5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Teachers</h2>
        <Button variant="default" size="sm" onClick={handleAddTeacher}>
          <Plus className="mr-1 h-4 w-4" />
          Add
        </Button>
      </div>

      <div className="overflow-y-auto space-y-2">
        {teachers.length === 0 && (
          <p className="text-sm text-muted-foreground">No teachers yet.</p>
        )}
        {teachers.map((teacher) => (
          <div
            key={teacher.id}
            className="flex items-center justify-between bg-card p-2 rounded-md"
          >
            <div>
              <p className="text-sm font-medium">{teacher.name}</p>
              <p className="text-xs text-muted-foreground">
                {teacher.subjects.join(", ")}
              </p>
            </div>
            <div className="flex space-x-2">
              <Button variant="ghost" size="icon" onClick={() => handleEditTeacher(teacher.id)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => handleDeleteTeacher(teacher.id)}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Teacher Modal */}
      {isModalOpen && currentOrg && (
        <TeacherModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          organizationId={currentOrg}
        />
      )}
    </div>
  );
}
