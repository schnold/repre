// src/lib/auth/auth-utils.ts
import { connectToDatabase } from '@/lib/db/mongoose';
import { User } from '@/lib/db/schemas';
import { getSession } from '@auth0/nextjs-auth0';


export async function isAdmin(userId: string): Promise<boolean> {
  await connectToDatabase();
  const user = await User.findOne({ auth0Id: userId });
  return user?.roles.includes('admin') || false;
}

export async function checkAuth() {
  const session = await getSession();
  if (!session) {
    redirect('/login');
  }
  return session;
}