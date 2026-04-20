import { AlertTriangle, RotateCcw } from "lucide-react";

import { Button, Card, CardContent } from "@/components/ui";

interface DashboardErrorStateProps {
  onRetry: () => void;
}

export default function DashboardErrorState({ onRetry }: DashboardErrorStateProps) {
  return (
    <Card>
      <CardContent className="mt-0 flex flex-col items-center gap-3 py-10 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-error-soft text-error">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <p className="text-sm text-text-secondary">Dashboard data could not be loaded.</p>
        <Button variant="outline" size="sm" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={onRetry}>
          Retry
        </Button>
      </CardContent>
    </Card>
  );
}

