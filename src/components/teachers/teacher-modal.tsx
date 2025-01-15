"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useUser } from "@auth0/nextjs-auth0/client";
import { fetchWithAuth } from "@/lib/api/fetch-with-auth";

interface TeacherModalProps {
  organizationId: string;
  onClose: () => void;
}

export function TeacherModal({ organizationId, onClose }: TeacherModalProps) {
  const { toast } = useToast();
  const { user } = useUser();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subjects, setSubjects] = useState("");
  const [isOpen, setIsOpen] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!user) return;

      const response = await fetchWithAuth(`/api/organizations/${organizationId}/teachers`, {
        method: "POST",
        user,
        body: JSON.stringify({
          name,
          email,
          subjects: subjects.split(",").map(s => s.trim()),
          status: "active"
        })
      });

      if (!response.ok) throw new Error("Failed to create teacher");

      toast({
        title: "Success",
        children: "Teacher created successfully"
      });

      setIsOpen(false);
      onClose();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        children: "Failed to create teacher"
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) onClose();
    }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Teacher</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="subjects">Subjects (comma-separated)</Label>
            <Input
              id="subjects"
              value={subjects}
              onChange={(e) => setSubjects(e.target.value)}
              placeholder="Math, Science, History"
              required
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => {
              setIsOpen(false);
              onClose();
            }}>
              Cancel
            </Button>
            <Button type="submit">Add Teacher</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 