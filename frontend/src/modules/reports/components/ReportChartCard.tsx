import type { ReactNode } from "react";

import { Card, CardContent, CardHeader } from "@/components/ui";

interface ReportChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export default function ReportChartCard({ title, subtitle, children }: ReportChartCardProps) {
  return (
    <Card>
      <CardHeader title={title} subtitle={subtitle} />
      <CardContent className="h-72">{children}</CardContent>
    </Card>
  );
}
