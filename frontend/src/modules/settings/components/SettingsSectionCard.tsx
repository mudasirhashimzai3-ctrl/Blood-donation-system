import { Button, Card, CardContent, CardHeader } from "@components/ui";

interface SettingsSectionCardProps {
  title: string;
  description: string;
  status?: "Live";
  onOpen: () => void;
}

export default function SettingsSectionCard({
  title,
  description,
  status,
  onOpen,
}: SettingsSectionCardProps) {
  return (
    <Card variant="outlined" className="h-full">
      <CardHeader
        title={title}
        action={
          status ? (
            <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800">
              {status}
            </span>
          ) : null
        }
      />
      <CardContent className="space-y-4">
        <p className="text-sm text-text-secondary">{description}</p>
        <Button type="button" variant="outline" onClick={onOpen} fullWidth>
          Open Section
        </Button>
      </CardContent>
    </Card>
  );
}
