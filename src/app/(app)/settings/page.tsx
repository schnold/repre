// FILE: src/app/(app)/settings/page.tsx
"use client";

import { Settings as SettingsIcon } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <SettingsIcon className="h-6 w-6 text-brand-500" />
        <h1 className="text-2xl font-bold">Settings</h1>
      </div>
      <p className="text-sm text-muted-foreground">
        Adjust your preferences, notifications, etc.
      </p>
      {/* Additional forms or sections here */}
    </div>
  );
}
