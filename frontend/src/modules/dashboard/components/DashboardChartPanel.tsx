import type { ReactNode } from "react";

import { Card, CardContent, CardHeader } from "@/components/ui";

interface DashboardChartPanelProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export default function DashboardChartPanel({ title, subtitle, children }: DashboardChartPanelProps) {
  return (
    <Card>
      <CardHeader title={title} subtitle={subtitle} />
      <CardContent className="h-72">{children}</CardContent>
    </Card>
  );
}
