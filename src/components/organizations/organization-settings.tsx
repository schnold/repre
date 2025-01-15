"use client";

import { useState } from "react";
import { IOrganization } from "@/lib/db/interfaces";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface OrganizationSettingsProps {
  organization: IOrganization;
}

export function OrganizationSettings({ organization }: OrganizationSettingsProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: organization.name,
    description: organization.description || "",
    settings: {
      timeZone: organization.settings?.timeZone || "UTC",
      workingHours: {
        start: organization.settings?.workingHours?.start || "09:00",
        end: organization.settings?.workingHours?.end || "17:00",
      },
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Submitting data:', formData);
      const response = await fetch(`/api/organizations/${organization._id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update organization");
      }

      const updatedOrg = await response.json();
      console.log('Update successful:', updatedOrg);

      toast({
        title: "Success",
        description: "Organization settings updated successfully",
      });

      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error("Error updating organization:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update organization settings",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Organization Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="timeZone">Time Zone</Label>
          <Select
            value={formData.settings.timeZone}
            onValueChange={(value) =>
              setFormData({
                ...formData,
                settings: { ...formData.settings, timeZone: value },
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select time zone" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="UTC">UTC</SelectItem>
              <SelectItem value="America/New_York">Eastern Time</SelectItem>
              <SelectItem value="America/Chicago">Central Time</SelectItem>
              <SelectItem value="America/Denver">Mountain Time</SelectItem>
              <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="workingHoursStart">Working Hours Start</Label>
            <Input
              id="workingHoursStart"
              type="time"
              value={formData.settings.workingHours.start}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  settings: {
                    ...formData.settings,
                    workingHours: {
                      ...formData.settings.workingHours,
                      start: e.target.value,
                    },
                  },
                })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="workingHoursEnd">Working Hours End</Label>
            <Input
              id="workingHoursEnd"
              type="time"
              value={formData.settings.workingHours.end}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  settings: {
                    ...formData.settings,
                    workingHours: {
                      ...formData.settings.workingHours,
                      end: e.target.value,
                    },
                  },
                })
              }
              required
            />
          </div>
        </div>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  );
} 