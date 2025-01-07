import { useAuth } from '@/hooks/use-auth';

interface RoleGateProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

export function RoleGate({ children, allowedRoles }: RoleGateProps) {
  const { hasRole } = useAuth();

  if (!hasRole(allowedRoles)) {
    return null;
  }

  return <>{children}</>;
}