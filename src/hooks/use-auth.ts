import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';

export type UserRole = 'admin' | 'editor' | 'viewer';

interface AuthUser {
  sub: string;
  email: string;
  email_verified?: boolean;
  name?: string;
  nickname?: string;
  picture?: string;
  roles: UserRole[];
  'https://repre.io/roles': UserRole[];
}

export function useAuth() {
  const { user: baseUser, error, isLoading } = useUser();
  const router = useRouter();

  // Cast the user to our extended type
  const user = baseUser as AuthUser | undefined;
  
  // Get roles from user metadata
  const roles = user?.roles || user?.['https://repre.io/roles'] || [];

  // Redirect if not authenticated
  useEffect(() => {
    if (!isLoading && !user && window.location.pathname !== '/login') {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  // Role checking functions
  const hasRole = useCallback((requiredRoles: UserRole | UserRole[]): boolean => {
    if (!user || !roles.length) return false;
    const rolesToCheck = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    return roles.some(role => rolesToCheck.includes(role as UserRole));
  }, [user, roles]);

  const isAdmin = useCallback(() => hasRole('admin'), [hasRole]);
  const isEditor = useCallback(() => hasRole(['admin', 'editor']), [hasRole]);
  const isViewer = useCallback(() => hasRole(['admin', 'editor', 'viewer']), [hasRole]);

  // Logout function
  const logout = useCallback(async () => {
    try {
      // Clear any client-side state here
      localStorage.clear();
      sessionStorage.clear();
      
      // Redirect to Auth0 logout
      window.location.assign('/api/auth/logout');
    } catch (error) {
      console.error('Logout failed:', error);
      router.push('/login');
    }
  }, [router]);

  return {
    user,
    error,
    isLoading,
    roles,
    hasRole,
    isAdmin,
    isEditor,
    isViewer,
    logout,
  };
}