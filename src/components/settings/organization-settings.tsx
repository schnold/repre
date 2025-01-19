"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Building2 } from "lucide-react";
import { useOrganizations } from "@/hooks/use-organizations";
import { useToast } from "@/components/ui/use-toast";
import { CreateOrganizationForm } from "../organizations/create-organization-form";
import { Skeleton } from "@/components/ui/skeleton";
import { OrganizationSelector } from "@/components/organizations/organization-selector";
import { useSelectedOrganization } from "@/hooks/use-selected-organization";

export function OrganizationSettings() {
  const { toast } = useToast();
  const { organizations, loading, refetchOrganizations } = useOrganizations();
  const { selectedOrganization } = useSelectedOrganization();
  const [isCreating, setIsCreating] = useState(false);

  const handleDeleteOrg = async (orgId: string) => {
    if (!confirm("Are you sure you want to delete this organization? This action cannot be undone.")) {
      return;
    }

    try {
      const response = await fetch(`/api/organizations/${orgId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete organization');
      }

      await refetchOrganizations();
      
      toast({
        title: "Organization deleted",
        description: "Organization has been deleted successfully",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete organization. Please try again.",
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

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Organizations</CardTitle>
            <CardDescription>
              Manage your organizations and their settings.
            </CardDescription>
          </div>
          {organizations.length > 0 && (
            <OrganizationSelector />
          )}
        </div>
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
                key={org._id.toString()}
                className="flex items-center justify-between rounded-lg border p-4"
              >
                <div className="space-y-1">
                  <h4 className="font-medium">{org.name}</h4>
                  {selectedOrganization?._id.toString() === org._id.toString() && (
                    <p className="text-sm text-muted-foreground">Current organization</p>
                  )}
                </div>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDeleteOrg(org._id.toString())}
                >
                  Delete
                </Button>
              </div>
            ))}

            {isCreating ? (
              <div className="rounded-lg border p-4">
                <CreateOrganizationForm
                  onSuccess={async () => {
                    await refetchOrganizations();
                    setIsCreating(false);
                  }}
                />
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