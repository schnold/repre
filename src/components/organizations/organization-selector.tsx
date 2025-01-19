"use client";

import { useEffect, useState } from 'react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { OrganizationDialog } from "./organization-dialog";
import { useToast } from '../ui/use-toast';
import { fetchWithAuth } from '@/lib/api/fetch-with-auth';
import { useUser } from '@auth0/nextjs-auth0/client';

interface Organization {
  _id: string;
  name: string;
}

interface OrganizationsResponse {
  organizations: Organization[];
  selectedOrganizationId?: string;
}

export function OrganizationSelector() {
  const { user } = useUser();
  const { toast } = useToast();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<string>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrganizations();
  }, [user]);

  const fetchOrganizations = async () => {
    try {
      if (!user) return;

      const response = await fetchWithAuth('/api/organizations', { user });
      if (!response.ok) {
        throw new Error('Failed to fetch organizations');
      }

      const data: OrganizationsResponse = await response.json();
      setOrganizations(data.organizations);
      setSelectedOrganizationId(data.selectedOrganizationId);
    } catch (error) {
      console.error('Error fetching organizations:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load organizations"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleOrganizationChange = async (organizationId: string) => {
    try {
      const response = await fetchWithAuth('/api/organizations', {
        user,
        method: 'PATCH',
        body: JSON.stringify({ organizationId })
      });

      if (!response.ok) {
        throw new Error('Failed to update selected organization');
      }

      setSelectedOrganizationId(organizationId);
      toast({
        title: "Success",
        description: "Organization updated successfully"
      });
    } catch (error) {
      console.error('Error updating organization:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update organization"
      });
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        value={selectedOrganizationId}
        onValueChange={handleOrganizationChange}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Select organization" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Organizations</SelectLabel>
            {organizations.map((org) => (
              <SelectItem key={org._id} value={org._id}>
                {org.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      <OrganizationDialog
        mode="create"
        trigger={
          <Button variant="outline" size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        }
        onSuccess={fetchOrganizations}
      />
    </div>
  );
} 