// src/app/layout.tsx
import { UserProvider } from '@auth0/nextjs-auth0/client';
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <UserProvider>
        <body className="bg-background text-foreground min-h-screen">
          {children}
        </body>
      </UserProvider>
    </html>
  );
}