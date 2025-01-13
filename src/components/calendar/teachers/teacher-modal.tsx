"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TeachersForm } from "./teachers-form";
import { useToast } from "@/components/ui/use-toast";

interface TeacherModalProps {
  isOpen: boolean;
  onClose: () => void;
  organizationId: string;
  onSuccess?: () => void;
}

export function TeacherModal({ 
  isOpen, 
  onClose, 
  organizationId,
  onSuccess 
}: TeacherModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {
      const response = await fetch("/api/teachers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          organizationId,
        }),
      });

      if (!response.ok) throw new Error("Failed to create teacher");

      toast({
        title: "Success",
        children: "Teacher created successfully",
      });
      onClose();
      onSuccess?.();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        children: "Failed to create teacher",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create New Teacher</DialogTitle>
        </DialogHeader>
        <TeachersForm onSubmit={handleSubmit} />
      </DialogContent>
    </Dialog>
  );
}
