"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { IOrganization } from '@/lib/db/interfaces';

export function useSelectedOrganization() {
  const [selectedOrganization, setSelectedOrganization] = useState<IOrganization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();

  const fetchSelectedOrg = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/selected-organization');
      if (!response.ok) throw new Error('Failed to fetch selected organization');
      
      const data = await response.json();
      if (data.organizationId) {
        const orgResponse = await fetch(`/api/organizations/${data.organizationId}`);
        if (!orgResponse.ok) throw new Error('Failed to fetch organization details');
        
        const organization = await orgResponse.json();
        setSelectedOrganization(organization);
      } else {
        setSelectedOrganization(null);
      }
    } catch (error) {
      console.error('Error fetching selected organization:', error);
      toast({
        title: "Error",
        description: "Failed to fetch selected organization",
        variant: "destructive",
      });
      setSelectedOrganization(null);
    } finally {
      setIsLoading(false);
    }
  };

  const selectOrganization = async (organizationId: string | null) => {
    try {
      if (!organizationId) {
        setSelectedOrganization(null);
        router.push('/organizations');
        return;
      }

      const response = await fetch('/api/admin/selected-organization', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ organizationId }),
      });

      if (!response.ok) throw new Error('Failed to update selected organization');

      // Fetch the organization details
      const orgResponse = await fetch(`/api/organizations/${organizationId}`);
      if (!orgResponse.ok) throw new Error('Failed to fetch organization details');
      
      const organization = await orgResponse.json();
      setSelectedOrganization(organization);
      router.push(`/organizations/${organizationId}`);
    } catch (error) {
      console.error('Error updating selected organization:', error);
      toast({
        title: "Error",
        description: "Failed to update selected organization",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchSelectedOrg();
  }, []);

  return {
    selectedOrganization,
    isLoading,
    selectOrganization,
    refetchSelectedOrg: fetchSelectedOrg
  };
} 