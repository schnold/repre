// FILE: src/components/dashboard/overview/admin-stats.tsx
"use client";

import { RoleGate } from "@/components/auth/role-gate";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminStats() {
  return (
    <RoleGate allowedRoles={["admin"]}>
      <Card>
        <CardHeader>
          <CardTitle>Admin Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Only admins can see this data!</p>
        </CardContent>
      </Card>
    </RoleGate>
  );
}
