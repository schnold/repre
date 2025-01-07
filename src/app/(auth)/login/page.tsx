// src/app/(auth)/login/page.tsx
import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Login - Repre",
  description: "Login to your account",
};

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="text-muted-foreground">
          Sign in to your account to continue
        </p>
      </div>
      
      <div className="space-y-4">
        <a href="/api/auth/login">
          <Button className="w-full" size="lg">
            Sign in with Auth0
          </Button>
        </a>

        <div className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </div>
      </div>

      <div className="pt-4">
        <Link href="/">
          <Button variant="ghost" className="w-full">
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back to home
          </Button>
        </Link>
      </div>
    </div>
  );
}