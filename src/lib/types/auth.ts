// src/lib/types/auth.ts
import { UserProfile } from '@auth0/nextjs-auth0/client';

export interface Auth0User extends UserProfile {
  'https://repre.io/roles'?: string[];
  sub: string;
  email: string;
  name?: string;
}

export type UserRole = 'admin' | 'schoolAdmin' | 'teacher' | 'substitute';

export interface NavigationItem {
  name: string;
  href: string;
  roles: UserRole[];
}