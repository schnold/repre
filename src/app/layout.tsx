// src/app/layout.tsx
import type { Metadata } from "next";
import { UserProvider } from '@auth0/nextjs-auth0/client';
import "./globals.css";

export const metadata: Metadata = {
  title: "Repre - School Representation Plan",
  description: "Efficiently manage teacher substitutions and class schedules",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <UserProvider>
        <body className="min-h-screen bg-background font-sans antialiased">
          {children}
        </body>
      </UserProvider>
    </html>
  );
}