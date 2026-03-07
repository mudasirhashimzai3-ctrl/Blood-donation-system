import { AlertTriangle } from "lucide-react";

import { Button, Card, CardContent } from "@/components/ui";

interface ReportErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export default function ReportErrorState({ message, onRetry }: ReportErrorStateProps) {
  return (
    <Card>
      <CardContent className="mt-0 flex flex-col items-start gap-3 py-6">
        <div className="flex items-center gap-2 text-error">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm font-medium">Failed to load analytics</span>
        </div>
        <p className="text-sm text-text-secondary">{message}</p>
        {onRetry ? (
          <Button size="sm" variant="outline" onClick={onRetry}>
            Retry
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
