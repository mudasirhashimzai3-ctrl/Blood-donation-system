import { Droplets, HandHeart, HeartPulse, Users } from "lucide-react";

import { DashboardCard } from "@/components";
import type { DashboardKpis } from "../types/dashboard.types";

type DashboardKpiGridState = "ready" | "loading" | "error";

interface DashboardKpiGridProps {
  kpis: DashboardKpis;
  state?: DashboardKpiGridState;
  onTotalDonorsClick: () => void;
  onTotalRecipientsClick: () => void;
  onActiveRequestsClick: () => void;
  onCompletedDonationsClick: () => void;
}

const formatValue = (value: number) => new Intl.NumberFormat().format(value);

export default function DashboardKpiGrid({
  kpis,
  state = "ready",
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
    },
    {
      title: "Total Recipients",
      data: kpis.total_recipients,
      icon: HeartPulse,
      color: "info" as const,
      onClick: onTotalRecipientsClick,
    },
    {
      title: "Active Requests",
      data: kpis.active_requests,
      icon: Droplets,
      color: "warning" as const,
      onClick: onActiveRequestsClick,
    },
    {
      title: "Completed Donations",
      data: kpis.completed_donations,
      icon: HandHeart,
      color: "success" as const,
      onClick: onCompletedDonationsClick,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => {
        const hasData = item.data !== null;
        const isAvailable = hasData && state === "ready";
        const subtitle =
          state === "loading"
            ? "Loading metrics..."
            : state === "error"
              ? "Data unavailable"
              : isAvailable
                ? "Click to view details"
                : "Restricted";
        const value = isAvailable && item.data ? formatValue(item.data.value) : "-";

        return (
          <button
            key={item.title}
            type="button"
            className="text-left disabled:cursor-default disabled:opacity-100"
            onClick={item.onClick}
            disabled={!isAvailable}
            aria-disabled={!isAvailable}
          >
            <DashboardCard title={item.title} value={value} icon={item.icon} color={item.color} subtitle={subtitle} />
          </button>
        );
      })}
    </div>
  );
}

