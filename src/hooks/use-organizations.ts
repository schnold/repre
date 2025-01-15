"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { IOrganization } from '@/lib/db/interfaces';
import { useToast } from '@/components/ui/use-toast';

export function useOrganizations() {
  const router = useRouter();
  const { toast } = useToast();
  const [organizations, setOrganizations] = useState<IOrganization[]>([]);
  const [currentOrg, setCurrentOrg] = useState<IOrganization | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    try {
      const response = await fetch('/api/organizations');
      if (!response.ok) {
        // Only redirect on 404 (no organizations found)
        if (response.status === 404) {
          toast({
            title: "No Organizations Found",
            description: "Please create your first organization",
          });
          router.push('/organizations/new');
        }
        return;
      }

      const data = await response.json();
      setOrganizations(data);

      // Set first organization as current if none selected and we have organizations
      if (!currentOrg && data.length > 0) {
        setCurrentOrg(data[0]);
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

  return {
    organizations,
    currentOrg,
    setCurrentOrg,
    loading,
  };
} 