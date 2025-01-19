import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Organization {
  _id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface OrganizationState {
  organizations: Organization[];
  selectedOrganization: Organization | null;
  setOrganizations: (organizations: Organization[]) => void;
  setSelectedOrganization: (organization: Organization | null) => void;
}

export const useOrganizationStore = create<OrganizationState>()(
  persist(
    (set) => ({
      organizations: [],
      selectedOrganization: null,
      setOrganizations: (organizations) => set({ organizations }),
      setSelectedOrganization: (organization) => set({ selectedOrganization: organization }),
    }),
    {
      name: 'organization-store',
    }
  )
); 