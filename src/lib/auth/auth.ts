import { getSession as getAuth0Session } from '@auth0/nextjs-auth0';
import { cookies, headers } from 'next/headers';

export async function getSession() {
  try {
    const session = await getAuth0Session();
    return session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

export async function getUserId() {
  const session = await getSession();
  return session?.user?.sub;
}

export async function getAuth0Id() {
  const session = await getSession();
  return session?.user?.sub;
}

export async function requireAuth() {
  const session = await getSession();
  if (!session) {
    throw new Error('Unauthorized');
  }
  return session;
} 