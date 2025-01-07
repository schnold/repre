// src/app/(auth)/signup/page.tsx
import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Sign Up - Repre",
  description: "Create your account",
};

export default function SignUpPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-bold">Create an account</h1>
        <p className="text-muted-foreground">
          Choose your preferred sign up method
        </p>
      </div>
      
      <div className="space-y-4">
        <a href="/api/auth/login">
          <Button className="w-full" size="lg">
            Sign up with Auth0
          </Button>
        </a>

        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
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