import { useUser } from '@auth0/nextjs-auth0/client';

export function useAuth() {
  const { user, error, isLoading } = useUser();

  const roles = user?.['https://repre.io/roles'] as string[] || [];

  const hasRole = (requiredRoles: string | string[]): boolean => {
    if (!user) return false;
    
    const rolesToCheck = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    return roles.some(role => rolesToCheck.includes(role));
  };

  const isAdmin = (): boolean => hasRole('admin');
  const isSchoolAdmin = (): boolean => hasRole(['admin', 'schoolAdmin']);
  const isTeacher = (): boolean => hasRole(['admin', 'schoolAdmin', 'teacher']);
  const isSubstitute = (): boolean => hasRole('substitute');

  return {
    user,
    error,
    isLoading,
    roles,
    hasRole,
    isAdmin,
    isSchoolAdmin,
    isTeacher,
    isSubstitute,
  };
}