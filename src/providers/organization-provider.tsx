"use client";

import { createContext, useContext, ReactNode } from 'react';
import { useSelectedOrganization } from '@/hooks/use-selected-organization';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';

const OrganizationContext = createContext<ReturnType<typeof useSelectedOrganization> | null>(null);

export function OrganizationProvider({ children }: { children: ReactNode }) {
  const organizationState = useSelectedOrganization();
  const pathname = usePathname() || '/';
  const router = useRouter();

  // Update routing when organization changes
  useEffect(() => {
    if (!organizationState.selectedOrganization) {
      // If no organization is selected, redirect to organizations page
      if (pathname !== '/organizations' && !pathname.startsWith('/organizations/')) {
        router.push('/organizations');
      }
    }
  }, [organizationState.selectedOrganization, pathname, router]);

  return (
    <OrganizationContext.Provider value={organizationState}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganizationContext() {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganizationContext must be used within an OrganizationProvider');
  }
  return context;
} 