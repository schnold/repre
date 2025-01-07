// FILE: src/app/(app)/help/page.tsx
"use client";

import { HelpCircle } from "lucide-react";

export default function HelpPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <HelpCircle className="h-6 w-6 text-brand-500" />
        <h1 className="text-2xl font-bold">Help & Support</h1>
      </div>
      <p className="text-sm text-muted-foreground">
        Find answers to common questions or contact support.
      </p>
      <div className="mt-4 p-4 bg-white border rounded-md shadow-sm">
        <p className="text-gray-700">
          This page can hold an FAQ or instructions for your users.
        </p>
      </div>
    </div>
  );
}
