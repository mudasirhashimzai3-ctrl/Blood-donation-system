import { RefreshCw } from "lucide-react";

import { PageHeader } from "@/components";

interface DashboardHeaderProps {
  onRefresh: () => void;
  refreshing?: boolean;
}

export default function DashboardHeader({ onRefresh, refreshing = false }: DashboardHeaderProps) {
  return (
    <PageHeader
      title="Dashboard"
      subtitle="Live operational overview of donors, recipients, requests, and donation workflow"
      actions={[
        {
          label: refreshing ? "Refreshing..." : "Refresh",
          icon: <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />,
          onClick: onRefresh,
          variant: "outline",
        },
      ]}
    />
  );
}
