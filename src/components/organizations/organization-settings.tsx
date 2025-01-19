"use client";

import { useState } from "react";
import { IOrganization } from "@/lib/db/models/organization";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { SchoolClassesManager } from "./school-classes-manager";
import { Types } from "mongoose";
import { ISchoolClass, ISubject } from "@/lib/db/models/organization";

interface OrganizationSettingsProps {
  organization: IOrganization;
}

export function OrganizationSettings({ organization }: OrganizationSettingsProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: organization.name,
    description: organization.description || "",
    address: organization.address || "",
    phone: organization.phone || "",
    email: organization.email || "",
    website: organization.website || "",
    classes: organization.classes || [],
    subjects: organization.subjects || [],
    timeZone: organization.timeZone || "UTC",
    workingHours: organization.workingHours || { start: "09:00", end: "17:00" }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/organizations/${organization._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update organization");
      }

      toast({
        title: "Success",
        description: "Organization updated successfully",
      });
    } catch (error) {
      console.error("Error updating organization:", error);
      toast({
        title: "Error",
        description: "Failed to update organization",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, description: e.target.value }))
            }
            className="min-h-[100px]"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, address: e.target.value }))
            }
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            value={formData.phone}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, phone: e.target.value }))
            }
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, email: e.target.value }))
            }
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="website">Website</Label>
          <Input
            id="website"
            type="url"
            value={formData.website}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, website: e.target.value }))
            }
          />
        </div>

        <div className="grid gap-2">
          <SchoolClassesManager
            classes={formData.classes}
            onChange={(classes) => setFormData((prev) => ({ ...prev, classes }))}
          />
        </div>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
} 