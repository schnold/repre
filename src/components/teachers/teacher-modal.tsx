"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TeacherForm, TeacherFormData } from "./teacher-form";
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
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (data: TeacherFormData) => {
    setIsLoading(true);
    try {
      console.log('Submitting data:', {
        ...data,
        organizationId,
      });

      const response = await fetch("/api/teachers", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...data,
          organizationId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error:', errorData);
        throw new Error(
          errorData.details?.email || 
          errorData.message || 
          'Failed to create teacher'
        );
      }

      toast({
        title: "Success",
        children: "Teacher created successfully",
      });
      onClose();
      onSuccess?.();
    } catch (error) {
      console.error('Submission error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        children: error instanceof Error ? error.message : "Failed to create teacher"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Teacher</DialogTitle>
        </DialogHeader>
        <TeacherForm onSubmit={handleSubmit} isLoading={isLoading} />
      </DialogContent>
    </Dialog>
  );
} 