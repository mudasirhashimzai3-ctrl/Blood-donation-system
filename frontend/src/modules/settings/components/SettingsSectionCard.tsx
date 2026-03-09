import { Button, Card, CardContent, CardHeader } from "@components/ui";

interface SettingsSectionCardProps {
  title: string;
  description: string;
  status: "Live" | "Planned";
  onOpen: () => void;
}

export default function SettingsSectionCard({
  title,
  description,
  status,
  onOpen,
}: SettingsSectionCardProps) {
  const statusClass =
    status === "Live"
      ? "bg-emerald-100 text-emerald-800"
      : "bg-slate-100 text-slate-700";

  return (
    <Card variant="outlined" className="h-full">
      <CardHeader
        title={title}
        action={<span className={`rounded-full px-2 py-1 text-xs font-medium ${statusClass}`}>{status}</span>}
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
