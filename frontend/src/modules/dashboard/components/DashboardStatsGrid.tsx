import { ClipboardCheck, Droplets, HandHeart, Users } from "lucide-react";

import { DashboardCard } from "@/components";
import type { DashboardSummary } from "../types/dashboard.types";

interface DashboardStatsGridProps {
  summary?: DashboardSummary;
  loading?: boolean;
}

export default function DashboardStatsGrid({ summary, loading = false }: DashboardStatsGridProps) {
  const totals = summary?.totals;
  const value = (count?: number) => (loading ? "..." : count ?? 0);

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <DashboardCard title="Total Donors" value={value(totals?.donors)} icon={Users} color="primary" />
      <DashboardCard title="Total Recipients" value={value(totals?.recipients)} icon={Droplets} color="info" />
      <DashboardCard
        title="Active Requests"
        value={value(totals?.active_requests)}
        icon={ClipboardCheck}
        color="warning"
      />
      <DashboardCard
        title="Completed Donations"
        value={value(totals?.completed_donations)}
        icon={HandHeart}
        color="success"
      />
    </div>
  );
}
