import { Card, CardContent } from "@/components/ui";
import type { DashboardAccess, DashboardStatistics } from "../types/dashboard.types";

type DashboardStatisticsState = "ready" | "loading" | "error";

interface DashboardStatisticsStripProps {
  statistics: DashboardStatistics;
  access: DashboardAccess;
  state?: DashboardStatisticsState;
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

export default function DashboardStatisticsStrip({
  statistics,
  access,
  state = "ready",
}: DashboardStatisticsStripProps) {
  const items = [
    {
      label: "Request Completion Rate",
      value:
        state === "loading"
          ? "Loading..."
          : state === "error"
            ? "Unavailable"
            : access.blood_requests
              ? renderPercentage(statistics.request_completion_rate)
              : "Restricted",
    },
    {
      label: "Donation Completion Rate",
      value:
        state === "loading"
          ? "Loading..."
          : state === "error"
            ? "Unavailable"
            : access.donations
              ? renderPercentage(statistics.donation_completion_rate)
              : "Restricted",
    },
    {
      label: "Avg Donation Response Time",
      value:
        state === "loading"
          ? "Loading..."
          : state === "error"
            ? "Unavailable"
            : access.donations
              ? renderMinutes(statistics.avg_donation_response_time_minutes)
              : "Restricted",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
      {items.map((item) => (
        <Card key={item.label} className="blood-card-accent">
          <CardContent className="mt-0">
            <p className="text-xs uppercase tracking-wide text-text-secondary">{item.label}</p>
            <p className="mt-2 text-2xl font-semibold text-text-primary">{item.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

