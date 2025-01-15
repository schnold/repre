"use client";

import { useEffect } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOrganizations } from "@/hooks/use-organizations";
import { useOrganization } from "@/hooks/use-organization";
import { IOrganization } from "@/lib/db/schema/organization";

export function OrganizationSelector() {
  const { organizations } = useOrganizations();
  const { selectedOrganization, setSelectedOrganization } = useOrganization();

  // Convert organization data to match IOrganization type
  const convertOrganization = (org: any): IOrganization & { _id: string } => ({
    ...org,
    createdAt: new Date(org.createdAt),
    updatedAt: new Date(org.updatedAt),
  });

  // Set first organization as default if none selected
  useEffect(() => {
    if (!selectedOrganization && organizations.length > 0) {
      setSelectedOrganization(convertOrganization(organizations[0]));
    }
  }, [organizations, selectedOrganization, setSelectedOrganization]);

  const handleOrganizationChange = (organizationId: string) => {
    const organization = organizations.find(org => org._id === organizationId);
    if (organization) {
      setSelectedOrganization(convertOrganization(organization));
    }
  };

  if (!organizations.length) {
    return null;
  }

  return (
    <Select
      value={selectedOrganization?._id}
      onValueChange={handleOrganizationChange}
    >
      <SelectTrigger className="w-[200px]">
        <SelectValue placeholder="Select organization" />
      </SelectTrigger>
      <SelectContent>
        {organizations.map((organization) => (
          <SelectItem key={organization._id} value={organization._id}>
            {organization.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
} 