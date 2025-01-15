'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useUser, UserProfile } from '@auth0/nextjs-auth0/client';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: {
    sub: string | undefined;
    email: string | undefined;
    name: string | undefined;
  } | null;
  error: Error | null;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  user: null,
  error: null
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user, error, isLoading } = useUser();
  const [authState, setAuthState] = useState<AuthContextType>({
    isAuthenticated: false,
    isLoading: true,
    user: null,
    error: null
  });

  useEffect(() => {
    setAuthState({
      isAuthenticated: !!user,
      isLoading,
      user: user ? {
        sub: user.sub ?? undefined,
        email: user.email ?? undefined,
        name: user.name ?? undefined
      } : null,
      error: error || null
    });
  }, [user, error, isLoading]);

  return (
    <AuthContext.Provider value={authState}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 