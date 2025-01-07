import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function OnboardingLoading() {
  return (
    <div className="container flex items-center justify-center min-h-screen py-10">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="h-6 w-2/3 bg-muted animate-pulse rounded" />
          <div className="h-4 w-4/5 bg-muted animate-pulse rounded mt-2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-muted animate-pulse rounded" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}