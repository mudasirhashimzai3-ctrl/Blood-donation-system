import { Button, Card, CardContent } from "@/components/ui";

interface ReportEmptyStateProps {
  message: string;
  onReset?: () => void;
}

export default function ReportEmptyState({ message, onReset }: ReportEmptyStateProps) {
  return (
    <Card>
      <CardContent className="mt-0 flex flex-col items-center gap-3 py-10 text-center">
        <p className="text-sm text-text-secondary">{message}</p>
        {onReset ? (
          <Button size="sm" variant="outline" onClick={onReset}>
            Reset filters
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
