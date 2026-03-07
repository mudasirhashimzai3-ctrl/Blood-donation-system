import { Card, CardContent } from "@/components/ui";
import type { DashboardAccess, DashboardStatistics } from "../types/dashboard.types";

interface DashboardStatisticsStripProps {
  statistics: DashboardStatistics;
  access: DashboardAccess;
}

const renderPercentage = (value: number | null) => {
  if (value === null) {
    return "-";
  }
  return `${value}%`;
};

const renderMinutes = (value: number | null) => {
  if (value === null) {
    return "-";
  }
  return `${value} min`;
};

export default function DashboardStatisticsStrip({ statistics, access }: DashboardStatisticsStripProps) {
  const items = [
    {
      label: "Request Completion Rate",
      value: access.blood_requests ? renderPercentage(statistics.request_completion_rate) : "Restricted",
    },
    {
      label: "Donation Completion Rate",
      value: access.donations ? renderPercentage(statistics.donation_completion_rate) : "Restricted",
    },
    {
      label: "Avg Donation Response Time",
      value: access.donations ? renderMinutes(statistics.avg_donation_response_time_minutes) : "Restricted",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
      {items.map((item) => (
        <Card key={item.label}>
          <CardContent className="mt-0">
            <p className="text-xs uppercase tracking-wide text-text-secondary">{item.label}</p>
            <p className="mt-2 text-2xl font-semibold text-text-primary">{item.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
