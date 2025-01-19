import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { OrganizationSettings } from './organization-settings';
import { OrganizationTeachers } from './organization-teachers';
import { OrganizationSchedules } from './organization-schedules';
import { OrganizationSubjects } from './organization-subjects';
import { useSelectedOrganization } from '@/hooks/use-selected-organization';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function OrganizationTabs() {
  const { selectedOrganization, isLoading } = useSelectedOrganization();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!selectedOrganization) {
    return (
      <Alert>
        <AlertDescription>
          Please select an organization from the dropdown menu.
        </AlertDescription>
      </Alert>
    );
  }

  const organizationId = selectedOrganization._id.toString();

  return (
    <Tabs defaultValue="settings" className="w-full">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="settings">Settings</TabsTrigger>
        <TabsTrigger value="teachers">Teachers</TabsTrigger>
        <TabsTrigger value="schedules">Schedules</TabsTrigger>
        <TabsTrigger value="subjects">Subjects</TabsTrigger>
      </TabsList>
      <TabsContent value="settings">
        <OrganizationSettings organization={selectedOrganization} />
      </TabsContent>
      <TabsContent value="teachers">
        <OrganizationTeachers organizationId={organizationId} />
      </TabsContent>
      <TabsContent value="subjects">
        <OrganizationSubjects organizationId={organizationId} />
      </TabsContent>
      <TabsContent value="schedules">
        <OrganizationSchedules organizationId={organizationId} />
      </TabsContent>
    </Tabs>
  );
} 