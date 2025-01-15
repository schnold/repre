import { OrganizationForm } from "@/components/admin/organization-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function NewOrganizationPage() {
  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Create New Organization</CardTitle>
        </CardHeader>
        <CardContent>
          <OrganizationForm />
        </CardContent>
      </Card>
    </div>
  );
} 