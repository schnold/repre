"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  if (isLoading || !user) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      <p className="text-muted-foreground">
        Welcome to your main application!
      </p>
      {/* rest of your dashboard UI */}
    </div>
  );
}
