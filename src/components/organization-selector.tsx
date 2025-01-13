"use client";

import * as React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOrganizations } from "@/hooks/use-organizations";
import { Building2, Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function OrganizationSelector() {
  const { organizations, currentOrg, setCurrentOrg, loading, getCurrentOrganization } = useOrganizations();
  const currentOrgData = getCurrentOrganization();

  if (loading) {
    return (
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4 text-muted-foreground animate-pulse" />
        <Skeleton className="h-4 w-[150px] animate-pulse" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        value={currentOrg || undefined}
        onValueChange={(value) => setCurrentOrg(value)}
      >
        <SelectTrigger className="org-selector-trigger">
          <Building2 className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
          <SelectValue placeholder="Select organization">
            {currentOrgData?.name || "Select organization"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent 
          className="org-selector-content"
          position="popper"
          side="bottom"
          align="start"
          sideOffset={8}
        >
          {organizations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 gap-2">
              <p className="text-sm text-muted-foreground">No organizations</p>
              <Button asChild variant="outline" size="sm" className="w-[180px]">
                <Link href="/settings/organization" className="flex items-center">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Organization
                </Link>
              </Button>
            </div>
          ) : (
            organizations.map((org) => (
              <SelectItem 
                key={org._id}
                value={org._id}
                className="org-selector-item"
              >
                {org.name}
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      {organizations.length > 0 && (
        <Button
          variant="ghost"
          size="icon"
          className="btn-icon"
          asChild
        >
          <Link href="/settings/organization">
            <Plus className="h-4 w-4" />
          </Link>
        </Button>
      )}
    </div>
  );
} 