// src/app/onboarding/layout.tsx
import { redirect } from 'next/navigation';
import { getSession } from '@auth0/nextjs-auth0';
import { User } from '@/lib/db/schemas';
import { connectToDatabase } from '@/lib/db/mongoose';

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  
  if (!session?.user) {
    redirect('/login');
  }

  // Check if user has already completed onboarding
  await connectToDatabase();
  const user = await User.findOne({ auth0Id: session.user.sub });
  
  // Check if user exists and has roles defined
  if (user?.roles && Array.isArray(user.roles) && user.roles.length > 0) {
    // User has already completed onboarding
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen flex flex-col">
      {children}
    </div>
  );
}