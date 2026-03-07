import { Droplets, HandHeart, HeartPulse, Users } from "lucide-react";

import { DashboardCard } from "@/components";
import { Card, CardContent } from "@/components/ui";
import type { DashboardKpis } from "../types/dashboard.types";

interface DashboardKpiGridProps {
  kpis: DashboardKpis;
  onTotalDonorsClick: () => void;
  onTotalRecipientsClick: () => void;
  onActiveRequestsClick: () => void;
  onCompletedDonationsClick: () => void;
}

const formatValue = (value: number) => new Intl.NumberFormat().format(value);

export default function DashboardKpiGrid({
  kpis,
  onTotalDonorsClick,
  onTotalRecipientsClick,
  onActiveRequestsClick,
  onCompletedDonationsClick,
}: DashboardKpiGridProps) {
  const items = [
    {
      title: "Total Donors",
      data: kpis.total_donors,
      icon: Users,
      color: "primary" as const,
      onClick: onTotalDonorsClick,
      emptyHint: "Donor metrics are unavailable for your current permissions.",
    },
    {
      title: "Total Recipients",
      data: kpis.total_recipients,
      icon: HeartPulse,
      color: "info" as const,
      onClick: onTotalRecipientsClick,
      emptyHint: "Recipient metrics are unavailable for your current permissions.",
    },
    {
      title: "Active Requests",
      data: kpis.active_requests,
      icon: Droplets,
      color: "warning" as const,
      onClick: onActiveRequestsClick,
      emptyHint: "Active request metrics are unavailable for your current permissions.",
    },
    {
      title: "Completed Donations",
      data: kpis.completed_donations,
      icon: HandHeart,
      color: "success" as const,
      onClick: onCompletedDonationsClick,
      emptyHint: "Donation metrics are unavailable for your current permissions.",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) =>
        item.data ? (
          <button key={item.title} type="button" className="text-left" onClick={item.onClick}>
            <DashboardCard
              title={item.title}
              value={formatValue(item.data.value)}
              icon={item.icon}
              color={item.color}
              subtitle="Click to view details"
            />
          </button>
        ) : (
          <Card key={item.title} variant="outlined" className="border-warning/40 bg-warning-soft/30">
            <CardContent className="mt-0 space-y-2">
              <p className="text-sm font-semibold text-text-primary">{item.title}</p>
              <p className="text-xs text-text-secondary">{item.emptyHint}</p>
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
}
