import { Card, CardContent, CardHeader } from "@components/ui";

interface PlannedSectionPanelProps {
  title: string;
  description?: string;
}

export default function PlannedSectionPanel({ title, description }: PlannedSectionPanelProps) {
  return (
    <Card>
      <CardHeader title={title} subtitle="Planned section" />
      <CardContent>
        <p className="text-sm text-text-secondary">
          {description || "This section is scaffolded and will be implemented in the next phase."}
        </p>
      </CardContent>
    </Card>
  );
}
