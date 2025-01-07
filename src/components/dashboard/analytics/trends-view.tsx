// FILE: src/components/dashboard/analytics/trends-view.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";

interface SubstitutionData {
  date: string;
  count: number;
}
interface TeacherData {
  date: string;
  count: number;
}

interface AnalyticsData {
  substitutionsOverTime: SubstitutionData[];
  activeTeachers: TeacherData[];
}

export default function TrendsView() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/analytics");
        if (!res.ok) {
          throw new Error("Failed to fetch analytics");
        }

        const json: AnalyticsData = await res.json();
        setData(json);
      } catch (caughtError: unknown) {
        if (caughtError instanceof Error) {
          setError(caughtError.message);
        } else {
          setError("An unknown error occurred.");
        }
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

  if (loading) return <p>Loading analytics...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;
  if (!data) return null; // no data scenario

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Substitutions Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-2 rounded">
            {JSON.stringify(data.substitutionsOverTime, null, 2)}
          </pre>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Active Teachers</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-2 rounded">
            {JSON.stringify(data.activeTeachers, null, 2)}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
