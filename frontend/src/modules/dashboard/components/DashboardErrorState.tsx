import { AlertTriangle, RotateCcw } from "lucide-react";

import { Button, Card, CardContent } from "@/components/ui";

interface DashboardErrorStateProps {
  onRetry: () => void;
}

export default function DashboardErrorState({ onRetry }: DashboardErrorStateProps) {
  return (
    <Card>
      <CardContent className="mt-0 flex flex-col items-center gap-3 py-10 text-center">
        <AlertTriangle className="h-8 w-8 text-error" />
        <p className="text-sm text-text-secondary">Dashboard data could not be loaded.</p>
        <Button variant="outline" size="sm" leftIcon={<RotateCcw className="h-4 w-4" />} onClick={onRetry}>
          Retry
        </Button>
      </CardContent>
    </Card>
  );
}
