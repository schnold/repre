"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSelectedOrganization } from "@/hooks/use-selected-organization";
import { Building2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrganizations } from "@/hooks/use-organizations";
import { useEffect } from "react";

export function OrganizationSelector() {
  const { selectedOrganization, selectOrganization, isLoading, refetchSelectedOrg } = useSelectedOrganization();
  const { organizations, refetchOrganizations } = useOrganizations();

  // Refresh organizations when the component mounts
  useEffect(() => {
    refetchOrganizations();
  }, []);

  if (isLoading) {
    return (
      <div className="w-[200px]">
        <Skeleton className="h-10" />
      </div>
    );
  }

  return (
    <div className="w-[200px]">
      <Select
        value={selectedOrganization?._id.toString() || ""}
        onValueChange={async (value) => {
          try {
            await selectOrganization(value || null);
            // Refresh organizations after selection changes
            refetchOrganizations();
          } catch (error) {
            console.error("Error selecting organization:", error);
          }
        }}
      >
        <SelectTrigger>
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <SelectValue placeholder="Select organization" />
          </div>
        </SelectTrigger>
        <SelectContent>
          {organizations.map((org) => (
            <SelectItem key={org._id.toString()} value={org._id.toString()}>
              {org.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
} 