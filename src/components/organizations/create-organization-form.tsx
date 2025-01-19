import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { SchoolClassesManager } from "./school-classes-manager";
import { SubjectManager } from "@/components/admin/subject-manager";
import { ISchoolClass } from "@/lib/db/models/organization";
import { TimezoneSelect } from "@/components/ui/timezone-select";
import { useOrganizations } from "@/hooks/use-organizations";
import { useSelectedOrganization } from "@/hooks/use-selected-organization";

interface OrganizationFormProps {
  onSuccess: () => void;
  organizationId?: string;
}

export function CreateOrganizationForm({ onSuccess, organizationId }: OrganizationFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const { refetchOrganizations } = useOrganizations();
  const { refetchSelectedOrg } = useSelectedOrganization();
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    timeZone: "UTC",
    workingHours: {
      start: "09:00",
      end: "17:00",
    },
    classes: [] as ISchoolClass[],
  });

  useEffect(() => {
    if (organizationId) {
      fetchOrganization();
    }
  }, [organizationId]);

  const fetchOrganization = async () => {
    try {
      const response = await fetch(`/api/organizations/${organizationId}`);
      if (!response.ok) throw new Error("Failed to fetch organization");
      const data = await response.json();
      setFormData(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch organization",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const url = organizationId 
      ? `/api/organizations/${organizationId}`
      : "/api/organizations";
    const method = organizationId ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(organizationId ? "Failed to update organization" : "Failed to create organization");
      }

      toast({
        title: "Success",
        description: organizationId ? "Organization updated successfully" : "Organization created successfully",
      });
      onSuccess();
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An error occurred",
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
          <Label>Time Zone</Label>
          <TimezoneSelect
            value={formData.timeZone}
            onChange={(value) => setFormData((prev) => ({ ...prev, timeZone: value }))}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="workStart">Working Hours Start</Label>
            <Input
              id="workStart"
              type="time"
              value={formData.workingHours.start}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  workingHours: { ...prev.workingHours, start: e.target.value },
                }))
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="workEnd">Working Hours End</Label>
            <Input
              id="workEnd"
              type="time"
              value={formData.workingHours.end}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  workingHours: { ...prev.workingHours, end: e.target.value },
                }))
              }
              required
            />
          </div>
        </div>

        <div className="grid gap-2">
          <SchoolClassesManager
            classes={formData.classes}
            onChange={(classes) => setFormData((prev) => ({ ...prev, classes }))}
          />
        </div>

        {organizationId && (
          <div className="grid gap-2">
            <SubjectManager organizationId={organizationId} />
          </div>
        )}
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? (organizationId ? "Updating..." : "Creating...") : (organizationId ? "Update Organization" : "Create Organization")}
      </Button>
    </form>
  );
} 