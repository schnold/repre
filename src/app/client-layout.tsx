'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/lib/query-client';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/toaster';
import { UserProvider } from '@auth0/nextjs-auth0/client';
import { Header } from '@/components/header';
import { useState, useEffect } from 'react';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <UserProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          value={{
            dark: "dark",
            light: "light",
          }}
        >
          <div className="min-h-screen flex flex-col">
            {mounted && <Header />}
            <main className="flex-1">
              {mounted ? children : null}
            </main>
          </div>
          <Toaster />
        </ThemeProvider>
      </QueryClientProvider>
    </UserProvider>
  );
} 