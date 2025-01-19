"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { IOrganization } from '@/lib/db/interfaces';
import { useToast } from '@/components/ui/use-toast';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface OrganizationState {
  organizations: IOrganization[];
  currentOrg: IOrganization | null;
  setCurrentOrg: (org: IOrganization | null) => void;
  setOrganizations: (orgs: IOrganization[]) => void;
}

const useOrganizationStore = create<OrganizationState>()(
  persist(
    (set) => ({
      organizations: [],
      currentOrg: null,
      setCurrentOrg: (org) => set({ currentOrg: org }),
      setOrganizations: (orgs) => set({ organizations: orgs }),
    }),
    {
      name: 'organization-storage',
    }
  )
);

export function useOrganizations() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const { organizations, currentOrg, setCurrentOrg: setStoreOrg, setOrganizations } = useOrganizationStore();

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const [orgsResponse, selectedOrgResponse] = await Promise.all([
        fetch('/api/organizations'),
        fetch('/api/admin/selected-organization')
      ]);

      if (!orgsResponse.ok) {
        if (orgsResponse.status === 404) {
          toast({
            title: "No Organizations Found",
            description: "Please create your first organization",
          });
          router.push('/organizations/new');
        }
        return;
      }

      const orgs = await orgsResponse.json();
      setOrganizations(orgs);

      // If we have a selected organization from admin profile, use that
      if (selectedOrgResponse.ok) {
        const { organizationId } = await selectedOrgResponse.json();
        if (organizationId) {
          const selectedOrg = orgs.find((o: IOrganization) => o._id.toString() === organizationId.toString());
          if (selectedOrg) {
            setCurrentOrg(selectedOrg);
            return;
          }
        }
      }

      // Fallback to first organization if no selected organization
      if (!currentOrg && orgs.length > 0) {
        setCurrentOrg(orgs[0]);
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch organizations",
      });
    } finally {
      setLoading(false);
    }
  };

  const setCurrentOrg = async (org: IOrganization | null) => {
    setStoreOrg(org);
    
    if (org) {
      // Update the admin's selected organization
      try {
        await fetch('/api/admin/selected-organization', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ organizationId: org._id }),
        });

        // Trigger refresh of related data
        fetch(`/api/organizations/${org._id}/teachers`);
        fetch(`/api/organizations/${org._id}/schedules`);
      } catch (error) {
        console.error('Error updating selected organization:', error);
      }
      
      router.refresh();
    }
  };

  return {
    organizations,
    currentOrg,
    setCurrentOrg,
    loading,
    refetchOrganizations: fetchOrganizations
  };
} 