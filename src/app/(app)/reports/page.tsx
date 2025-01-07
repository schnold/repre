// FILE: src/app/(app)/reports/page.tsx
"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { BarChart2 } from "lucide-react";

export default function ReportsPage() {
  const { user, isLoading } = useUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [isLoading, user, router]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <BarChart2 className="h-6 w-6 text-brand-500" />
        <h1 className="text-2xl font-bold">Reports</h1>
      </div>
      <p className="text-sm text-muted-foreground">
        Generate or view scheduling-related reports.
      </p>
      <div className="mt-4 p-4 bg-white border rounded-md shadow-sm">
        <p className="text-gray-700">
          No reports yet. This placeholder can be expanded with advanced
          analytics or PDF exports.
        </p>
      </div>
    </div>
  );
}
