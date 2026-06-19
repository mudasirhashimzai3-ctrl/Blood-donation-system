import { AlertTriangle } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button, Card, CardContent } from "@/components/ui";

interface ReportErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export default function ReportErrorState({ message, onRetry }: ReportErrorStateProps) {
  const { t } = useTranslation();
  return (
    <Card>
      <CardContent className="mt-0 flex flex-col items-start gap-3 py-6">
        <div className="flex items-center gap-2 text-error">
          <AlertTriangle className="h-4 w-4" />
          <span className="text-sm font-medium">
            {t("reports.errors.analyticsFailed", "Failed to load analytics")}
          </span>
        </div>
        <p className="text-sm text-text-secondary">{message}</p>
        {onRetry ? (
          <Button size="sm" variant="outline" onClick={onRetry}>
            {t("common.retry", "Retry")}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
