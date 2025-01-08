// FILE: /src/components/auth/AuthDebug.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/hooks/use-auth";

export function AuthDebug() {
  const { user, roles, isAdmin } = useAuth();

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle>Auth Debug Info</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm space-y-2">
          <div><strong>Email:</strong> {user?.email}</div>
          <div><strong>Sub:</strong> {user?.sub}</div>
          <div><strong>Raw Auth0 Roles:</strong> {JSON.stringify(user?.['https://repre.io/roles'])}</div>
          <div><strong>Processed Roles:</strong> {JSON.stringify(roles)}</div>
          <div><strong>Is Admin:</strong> {isAdmin() ? 'Yes' : 'No'}</div>
        </div>

        {(!roles || roles.length === 0) && (
          <Alert variant="destructive">
            <AlertDescription>
              No roles detected. Please check Auth0 configuration or try logging out and back in.
            </AlertDescription>
          </Alert>
        )}

        <div className="text-xs text-muted-foreground">
          Full user object for debugging:
          <pre className="mt-2 p-2 bg-gray-100 rounded overflow-auto">
            {JSON.stringify(user, null, 2)}
          </pre>
        </div>
      </CardContent>
    </Card>
  );
}

