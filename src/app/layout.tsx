// FILE: src/app/layout.tsx
import { Metadata } from "next";
import { UserProvider } from "@auth0/nextjs-auth0/client";
import "./globals.css";

export const metadata: Metadata = {
  title: "Repre - Award-Winning App",
  description: "Manage teacher substitutions with style",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-background text-foreground">
        <UserProvider>{children}</UserProvider>
      </body>
    </html>
  );
}
