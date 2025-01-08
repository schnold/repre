import { UserProfile } from '@auth0/nextjs-auth0/client';

export type UserRole = 'admin' | 'editor' | 'viewer';

export interface Auth0UserMetadata {
  [key: string]: unknown;
}

export interface Auth0User extends UserProfile {
  'https://repre.io/roles'?: UserRole[];
  email: string;
  email_verified?: boolean;
  name?: string;
  picture?: string;
  sub: string;
  updated_at?: string;
  user_metadata?: Auth0UserMetadata;
}