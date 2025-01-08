import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import { useCalendarStore } from '@/store/calendar-store';
import { useTeacherStore } from '@/store/teacher-store';
import { Auth0User, UserRole } from '@/lib/types/auth';

export function useAuth() {
  const { user: baseUser, error, isLoading } = useUser();
  const router = useRouter();
  const resetCalendar = useCalendarStore((state) => state.clearEvents);
  const resetTeachers = useTeacherStore((state) => state.clearTeachers);

  // Cast the user to our extended type
  const user = baseUser as Auth0User | undefined;

  // Get roles from user metadata with proper typing
  const roles: UserRole[] = (user?.['https://repre.io/roles'] || []) as UserRole[];
  
  const hasRole = (requiredRoles: UserRole | UserRole[]): boolean => {
    if (!user) return false;
    
    const rolesToCheck = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    
    console.log('Role check:', {
      userEmail: user.email,
      userRoles: roles,
      requiredRoles: rolesToCheck,
      hasMatch: roles.some(role => rolesToCheck.includes(role))
    });

    return roles.some(role => rolesToCheck.includes(role));
  };

  const logout = async () => {
    try {
      resetCalendar();
      resetTeachers();
      localStorage.clear();
      sessionStorage.clear();
      window.location.assign('/api/auth/logout');
    } catch (error) {
      console.error('Logout failed:', error);
      router.push('/landing');
    }
  };

  return {
    user,
    error,
    isLoading,
    roles,
    hasRole,
    logout,
    isAdmin: () => hasRole('admin'),
    isEditor: () => hasRole(['admin', 'editor']),
    isViewer: () => hasRole(['admin', 'editor', 'viewer']),
    
  };
}