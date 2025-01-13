// src/lib/auth/auth-utils.ts
import { redirect } from 'next/navigation';
import { getSession, Session } from '@auth0/nextjs-auth0';
import { connectToDatabase } from '@/lib/db/mongoose';
import { IUser } from '@/lib/db/schemas';

export async function isAdmin(session?: Session | null): Promise<boolean> {
  if (!session) {
    session = await getSession();
  }
  if (!session?.user?.id) return false;
  return session.user.organizations?.some(
    (org: { role: string }) => org.role === 'admin'
  ) ?? false;
}

export async function checkAuth() {
  const session = await getSession();
  if (!session?.user) redirect('/login');
  return session;
}