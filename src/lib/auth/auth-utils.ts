// src/lib/auth/auth-utils.ts
import { redirect } from 'next/navigation';
import { getSession } from '@auth0/nextjs-auth0';
import { connectToDatabase } from '@/lib/db/mongoose';
import { User } from '@/lib/db/schemas';
import { Session } from "next-auth";

export function isAdmin(session: Session | null): boolean {
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