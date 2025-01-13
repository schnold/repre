"use client";

import { useState, useEffect } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { useUser } from '@auth0/nextjs-auth0/client';

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
  admins: string[];
  members: string[];
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

type CreateOrganizationData = {
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
};

const STORAGE_KEY = 'selectedOrganizationId';

export function useOrganizations() {
  const { user, isLoading: userLoading } = useUser();
  const { toast } = useToast();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrg, setCurrentOrg] = useState<string | null>(() => {
    // Try to get the stored organization ID on initial load
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY);
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  // Fetch organizations when user is loaded
  useEffect(() => {
    if (!userLoading && user) {
      fetchOrganizations();
    }
  }, [user, userLoading]);

  // Persist selected organization
  useEffect(() => {
    if (currentOrg) {
      localStorage.setItem(STORAGE_KEY, currentOrg);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [currentOrg]);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/organizations');
      if (!response.ok) throw new Error('Failed to fetch organizations');
      const data = await response.json();
      
      // Ensure we have all required fields
      const validatedData = data.map((org: any) => ({
        _id: org._id,
        name: org.name,
        type: org.type || 'school',
        settings: {
          timezone: org.settings?.timezone || 'UTC',
          workingDays: org.settings?.workingDays || [1, 2, 3, 4, 5],
          defaultWorkingHours: {
            start: org.settings?.workingHours?.start || '09:00',
            end: org.settings?.workingHours?.end || '17:00'
          }
        },
        admins: org.admins || [],
        members: org.members || [],
        createdBy: org.createdBy,
        createdAt: org.createdAt,
        updatedAt: org.updatedAt
      }));
      
      setOrganizations(validatedData);
      
      // Always ensure an organization is selected if available
      if (validatedData.length > 0) {
        const storedOrgId = localStorage.getItem(STORAGE_KEY);
        const storedOrgExists = validatedData.some((org: Organization) => org._id === storedOrgId);
        
        if (!storedOrgExists || !currentOrg) {
          // If stored org doesn't exist or no org is selected, select the first available org
          setCurrentOrg(validatedData[0]._id);
          localStorage.setItem(STORAGE_KEY, validatedData[0]._id);
        }
      } else {
        setCurrentOrg(null);
        localStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.error('Error fetching organizations:', error);
      toast({
        variant: "destructive",
        title: "Error",
        children: "Failed to load organizations"
      });
    } finally {
      setLoading(false);
    }
  };

  const createOrganization = async (orgData: CreateOrganizationData) => {
    try {
      const response = await fetch('/api/admin/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orgData),
      });

      if (!response.ok) throw new Error('Failed to create organization');
      
      const newOrg = await response.json();
      setOrganizations(prev => [...prev, newOrg]);
      
      // Automatically select the new organization if none is selected
      if (!currentOrg) {
        setCurrentOrg(newOrg._id);
      }
      
      toast({
        title: "Success",
        children: "Organization created successfully"
      });

      return newOrg;
    } catch (error) {
      console.error('Error creating organization:', error);
      toast({
        variant: "destructive",
        title: "Error",
        children: "Failed to create organization"
      });
      throw error;
    }
  };

  const updateOrganization = async (id: string, updates: Partial<CreateOrganizationData>) => {
    try {
      const response = await fetch(`/api/admin/organizations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) throw new Error('Failed to update organization');
      
      const updatedOrg = await response.json();
      setOrganizations(prev => 
        prev.map(org => org._id === id ? updatedOrg : org)
      );

      toast({
        title: "Success",
        children: "Organization updated successfully"
      });

      return updatedOrg;
    } catch (error) {
      console.error('Error updating organization:', error);
      toast({
        variant: "destructive",
        title: "Error",
        children: "Failed to update organization"
      });
      throw error;
    }
  };

  const deleteOrganization = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/organizations/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete organization');

      setOrganizations(prev => prev.filter(org => org._id !== id));
      if (currentOrg === id) {
        setCurrentOrg(organizations[0]?._id || null);
      }

      toast({
        title: "Success",
        children: "Organization deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting organization:', error);
      toast({
        variant: "destructive",
        title: "Error",
        children: "Failed to delete organization"
      });
      throw error;
    }
  };

  const getCurrentOrganization = () => {
    return organizations.find(org => org._id === currentOrg) || null;
  };

  return {
    organizations,
    currentOrg,
    setCurrentOrg,
    loading: loading || userLoading,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    getCurrentOrganization,
    refetch: fetchOrganizations,
  };
} 