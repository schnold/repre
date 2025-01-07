"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@auth0/nextjs-auth0/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect } from "react";

export default function LoginPage() {
  const router = useRouter();
  const { user, isLoading } = useUser();

  useEffect(() => {
    // Redirect to the dashboard if the user is logged in
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  // If Auth0 is still checking session state, show a simple loading indicator
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  // Return null while redirecting
  if (user) {
    return null;
  }

  return (
    <div className="flex h-screen items-center justify-center bg-muted/50">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-center text-2xl font-bold">
            Welcome back
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-sm text-muted-foreground">
            Sign in to your account to continue
          </p>
          <Link href="/api/auth/login" legacyBehavior passHref>
            <Button className="w-full" size="lg">
              Sign in with Auth0
            </Button>
          </Link>
          <div className="text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>
          <div className="pt-4">
            <Link href="/">
              <Button variant="ghost" className="w-full">
                &larr; Back to home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
