import { getSession } from '@auth0/nextjs-auth0';
import { redirect } from 'next/navigation';

export async function checkAuth() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }
  return session;
}