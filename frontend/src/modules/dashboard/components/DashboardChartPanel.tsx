import type { ReactNode } from "react";

import { Card } from "@/components/ui";

interface DashboardChartPanelProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

export default function DashboardChartPanel({ title, subtitle, children }: DashboardChartPanelProps) {
  return (
    <Card className="chart-container p-5">
      <div className="chart-header mb-0">
        <div>
          <h3 className="chart-title">{title}</h3>
          {subtitle ? <p className="mt-1 text-sm text-text-secondary">{subtitle}</p> : null}
        </div>
      </div>
      <div className="min-h-0 flex-1">{children}</div>
    </Card>
  );
}

