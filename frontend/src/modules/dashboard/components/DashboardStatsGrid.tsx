import { ClipboardCheck, Droplets, HandHeart, Users } from "lucide-react";
import { useTranslation } from "react-i18next";

import { DashboardCard } from "@/components";
import type { DashboardSummary } from "../types/dashboard.types";

interface DashboardStatsGridProps {
  summary?: DashboardSummary;
  loading?: boolean;
}

export default function DashboardStatsGrid({ summary, loading = false }: DashboardStatsGridProps) {
  const { t } = useTranslation();
  const totals = summary?.totals;
  const value = (count?: number) => (loading ? "..." : count ?? 0);

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <DashboardCard title={t("dashboard.stats.totalDonors", "Total Donors")} value={value(totals?.donors)} icon={Users} color="primary" />
      <DashboardCard title={t("dashboard.stats.totalRecipients", "Total Recipients")} value={value(totals?.recipients)} icon={Droplets} color="info" />
      <DashboardCard
        title={t("dashboard.stats.activeRequests", "Active Requests")}
        value={value(totals?.active_requests)}
        icon={ClipboardCheck}
        color="warning"
      />
      <DashboardCard
        title={t("dashboard.stats.completedDonations", "Completed Donations")}
        value={value(totals?.completed_donations)}
        icon={HandHeart}
        color="success"
      />
    </div>
  );
}
