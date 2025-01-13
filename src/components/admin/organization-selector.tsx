"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOrganizations } from "@/hooks/use-organizations";

export function OrganizationSelector() {
  const { organizations, currentOrg, setCurrentOrg } = useOrganizations();

  return (
    <div className="w-[200px]">
      <Select
        value={currentOrg || ''}
        onValueChange={setCurrentOrg}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select organization" />
        </SelectTrigger>
        <SelectContent>
          {organizations.map((org) => (
            <SelectItem key={org.id} value={org.id}>
              {org.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
} 