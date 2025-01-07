// src/app/(auth)/signup/page.tsx
import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Sign Up - Repre",
  description: "Create your account",
};

export default function SignUpPage() {
  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Link
        href="/"
        className="absolute left-4 top-4 md:left-8 md:top-8"
      >
        <Button variant="ghost">
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
      </Link>
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">Create an account</CardTitle>
            <CardDescription className="text-center">
              Choose your preferred sign up method
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Button className="w-full" asChild>
              <a href="/api/auth/signup?returnTo=/onboarding">Create account with Auth0</a>
            </Button>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or
                </span>
              </div>
            </div>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/login">Sign in to existing account</Link>
            </Button>
          </CardContent>
        </Card>
        <p className="text-center text-sm text-muted-foreground">
          By clicking continue, you agree to our{" "}
          <Link href="/terms" className="underline underline-offset-4 hover:text-primary">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className="underline underline-offset-4 hover:text-primary">
            Privacy Policy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}