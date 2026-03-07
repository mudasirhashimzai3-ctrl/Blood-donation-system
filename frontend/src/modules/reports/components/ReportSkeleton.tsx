import { Card, CardContent } from "@/components/ui";

export default function ReportSkeleton() {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index}>
            <CardContent className="mt-0 animate-pulse space-y-2">
              <div className="h-3 w-24 rounded bg-surface-hover" />
              <div className="h-8 w-20 rounded bg-surface-hover" />
              <div className="h-3 w-16 rounded bg-surface-hover" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Card>
        <CardContent className="mt-0 h-72 animate-pulse rounded bg-surface-hover" />
      </Card>
    </div>
  );
}
