"use client";


import Link from "next/link";
import { useRouter } from "next/navigation";
import { useUser } from "@auth0/nextjs-auth0/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";



export default function LoginPage() {
  const router = useRouter();
  const { user, isLoading } = useUser();

  // If Auth0 is still checking session state, show a simple loading indicator
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  // If already logged in, redirect to the dashboard (or wherever you want)
  if (user) {
    router.push("/dashboard");
    return null; // Return nothing while we redirect
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

          {/* 
            Because Auth0 uses a redirect flow by default, 
            we can just link straight to "/api/auth/login" 
            to trigger the Auth0 login process.
            If you’d rather avoid the ESLint warning about <a> => 
            you can either disable that rule or wrap in <Link> 
          */}
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
