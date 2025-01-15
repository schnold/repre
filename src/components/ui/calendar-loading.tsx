import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function CalendarLoading() {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-10 w-[240px]" />
      </div>

      <div className="grid grid-cols-7 gap-4">
        {Array.from({ length: 31 }, (_, i) => (
          <Card key={i} className="min-h-[200px]">
            <CardHeader className="p-3">
              <CardTitle>
                <Skeleton className="h-4 w-20" />
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
} 