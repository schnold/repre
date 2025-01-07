// src/app/(app)/layout.tsx
import { redirect } from 'next/navigation';
import { getSession } from '@auth0/nextjs-auth0';
import { MainNav } from '@/components/layout/header/main-nav';
import { UserNav } from '@/components/layout/header/user-nav';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session?.user) {
    redirect('/login');
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="flex h-16 items-center px-4">
          <div className="flex items-center space-x-4">
            <span className="font-bold text-2xl">Repre</span>
          </div>
          <MainNav />
          <div className="ml-auto flex items-center space-x-4">
            <UserNav />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {children}
      </main>
    </div>
  );
}