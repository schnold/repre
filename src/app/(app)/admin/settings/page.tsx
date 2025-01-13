"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { OrganizationSettings } from "@/components/admin/settings/organization-settings";
import { UserSettings } from "@/components/admin/settings/user-settings";
import { NotificationSettings } from "@/components/admin/settings/notification-settings";
import { SecuritySettings } from "@/components/admin/settings/security-settings";
import { useOrganizations } from "@/hooks/use-organizations";

export default function SettingsPage() {
  const { currentOrg } = useOrganizations();

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      
      <Tabs defaultValue="organization" className="space-y-4">
        <TabsList>
          <TabsTrigger value="organization">Organization</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="organization">
          {currentOrg && <OrganizationSettings organizationId={currentOrg} />}
        </TabsContent>

        <TabsContent value="users">
          {currentOrg && <UserSettings organizationId={currentOrg} />}
        </TabsContent>

        <TabsContent value="notifications">
          {currentOrg && <NotificationSettings organizationId={currentOrg} />}
        </TabsContent>

        <TabsContent value="security">
          {currentOrg && <SecuritySettings organizationId={currentOrg} />}
        </TabsContent>
      </Tabs>
    </div>
  );
} 