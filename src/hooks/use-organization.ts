"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { IOrganization } from '@/lib/db/schema/organization';

interface OrganizationStore {
  selectedOrganization: (IOrganization & { _id: string }) | null;
  setSelectedOrganization: (org: (IOrganization & { _id: string }) | null) => void;
}

const useOrganizationStore = create<OrganizationStore>()(
  persist(
    (set) => ({
      selectedOrganization: null,
      setSelectedOrganization: (org) => set({ selectedOrganization: org }),
    }),
    {
      name: 'organization-storage',
    }
  )
);

export function useOrganization() {
  const { selectedOrganization, setSelectedOrganization } = useOrganizationStore();

  return {
    selectedOrganization,
    setSelectedOrganization,
  };
} 