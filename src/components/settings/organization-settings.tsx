"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useOrganizations } from "@/hooks/use-organizations";
import { Skeleton } from "@/components/ui/skeleton";
import { Building2 } from "lucide-react";

interface Organization {
  _id: string;
  name: string;
  type: 'school' | 'district' | 'other';
  settings: {
    timezone: string;
    workingDays: number[];
    defaultWorkingHours: {
      start: string;
      end: string;
    };
  };
}

export function OrganizationSettings() {
  const { toast } = useToast();
  const { organizations, loading, currentOrg, createOrganization, updateOrganization, deleteOrganization } = useOrganizations();
  const [isCreating, setIsCreating] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [editingOrg, setEditingOrg] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const handleCreateOrg = async () => {
    if (!newOrgName.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        children: "Organization name is required.",
      });
      return;
    }

    try {
      await createOrganization({
        name: newOrgName,
        type: 'school',
        settings: {
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          workingDays: [1, 2, 3, 4, 5], // Monday to Friday
          defaultWorkingHours: {
            start: "08:00",
            end: "16:00"
          }
        }
      });
      setIsCreating(false);
      setNewOrgName("");
      toast({
        title: "Organization created",
        children: "Your organization has been created successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        children: "Failed to create organization. Please try again.",
      });
    }
  };

  const handleUpdateOrg = async (orgId: string) => {
    if (!editName.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        children: "Organization name is required.",
      });
      return;
    }

    try {
      await updateOrganization(orgId, { name: editName });
      setEditingOrg(null);
      setEditName("");
      toast({
        title: "Organization updated",
        children: "Organization has been updated successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        children: "Failed to update organization. Please try again.",
      });
    }
  };

  const handleDeleteOrg = async (orgId: string) => {
    if (!confirm("Are you sure you want to delete this organization? This action cannot be undone.")) {
      return;
    }

    try {
      await deleteOrganization(orgId);
      toast({
        title: "Organization deleted",
        children: "Organization has been deleted successfully.",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        children: "Failed to delete organization. Please try again.",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  const currentOrgData = organizations.find(org => org._id === currentOrg);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Organizations</CardTitle>
        <CardDescription>
          Manage your organizations and their settings.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {organizations.length === 0 && !isCreating ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Building2 className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 font-medium">No organizations</h3>
            <p className="text-sm text-muted-foreground">
              Create an organization to get started.
            </p>
            <Button
              className="mt-4"
              onClick={() => setIsCreating(true)}
            >
              Create organization
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {organizations.map((org) => (
              <div
                key={org._id}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                {editingOrg === org._id ? (
                  <div className="flex flex-1 items-center gap-4">
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder="Organization name"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleUpdateOrg(org._id)}
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingOrg(null);
                          setEditName("");
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="space-y-1">
                      <h4 className="font-medium">{org.name}</h4>
                      {currentOrgData?._id === org._id && (
                        <p className="text-sm text-muted-foreground">Current organization</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingOrg(org._id);
                          setEditName(org.name);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteOrg(org._id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}

            {isCreating ? (
              <div className="flex items-center gap-4 rounded-lg border p-4">
                <Input
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  placeholder="Organization name"
                />
                <div className="flex gap-2">
                  <Button onClick={handleCreateOrg}>Create</Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCreating(false);
                      setNewOrgName("");
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                className="w-full"
                variant="outline"
                onClick={() => setIsCreating(true)}
              >
                Add organization
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 