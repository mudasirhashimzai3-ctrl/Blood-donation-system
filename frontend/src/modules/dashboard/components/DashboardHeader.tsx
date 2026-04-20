import { RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";

import { PageHeader } from "@/components";

interface DashboardHeaderProps {
  onRefresh: () => void;
  refreshing?: boolean;
}

export default function DashboardHeader({ onRefresh, refreshing = false }: DashboardHeaderProps) {
  const { t } = useTranslation();

  return (
    <PageHeader
      title={t("dashboard.title", "Operations Dashboard")}
      subtitle={t(
        "dashboard.subtitle",
        "Real-time view of donor availability, active requests, and donation outcomes"
      )}
      actions={[
        {
          label: refreshing ? t("common.refreshing", "Refreshing...") : t("common.refresh", "Refresh Data"),
          icon: <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />,
          onClick: onRefresh,
          variant: "outline",
        },
      ]}
    />
  );
}
