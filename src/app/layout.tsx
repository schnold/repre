// FILE: src/app/layout.tsx
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

import { UserProvider } from "@auth0/nextjs-auth0/client";
import { AuthProvider } from '@/lib/auth/auth-context';
import { Toaster } from "@/components/ui/toaster";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Calendar App',
  description: 'A modern calendar application for managing schedules and events',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} dark`} suppressHydrationWarning>
        <UserProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
          <Toaster />
        </UserProvider>
      </body>
    </html>
  );
}
