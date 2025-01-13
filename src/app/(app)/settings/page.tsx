// FILE: src/app/(app)/settings/page.tsx
"use client";

import { useUser } from "@auth0/nextjs-auth0/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserProfile } from "@/components/settings/user-profile";
import { OrganizationSettings } from "@/components/settings/organization-settings";
import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsPage() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="container py-8">
        <Skeleton className="h-8 w-[200px] mb-8" />
        <div className="space-y-4">
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container py-8">
        <h1 className="text-2xl font-bold mb-8">Settings</h1>
        <p>Please sign in to access settings.</p>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <h1 className="text-2xl font-bold mb-8">Settings</h1>
      <Tabs defaultValue="account" className="space-y-4">
        <TabsList>
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="organizations">Organizations</TabsTrigger>
        </TabsList>
        <TabsContent value="account" className="space-y-4">
          <UserProfile user={user} />
        </TabsContent>
        <TabsContent value="organizations" className="space-y-4">
          <OrganizationSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
