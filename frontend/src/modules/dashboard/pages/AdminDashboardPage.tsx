import { useNavigate } from "react-router-dom";

import { PageHeader } from "@/components";
import { Card, CardContent } from "@components/ui";
import DashboardCharts from "../components/DashboardCharts";
import DashboardStatsGrid from "../components/DashboardStatsGrid";
import DonorSearchPanel from "../components/DonorSearchPanel";
import { useDashboardActiveRequests, useDashboardSummary } from "../queries/useDashboardQueries";

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const summaryQuery = useDashboardSummary();
  const requestsQuery = useDashboardActiveRequests();
  const activeRequests = requestsQuery.data?.results ?? [];

  return (
    <div className="space-y-6">
     
      <PageHeader
        title="Admin Dashboard"
        subtitle="Monitor blood donation activity and find eligible nearby donors"
        actions={[
          {
            label: "Notification Radius",
            onClick: () => navigate("/settings?tab=system_settings&section=auto_matching"),
          },
        ]}
      />

      <DashboardStatsGrid summary={summaryQuery.data} loading={summaryQuery.isLoading} />

      {summaryQuery.error ? (
        <Card>
          <CardContent className="text-sm text-error">Failed to load dashboard statistics.</CardContent>
        </Card>
      ) : null}

      <DashboardCharts summary={summaryQuery.data} />

      <DonorSearchPanel
        requests={activeRequests}
        requestsLoading={requestsQuery.isLoading}
        title="Advanced Donor Search"
        subtitle="Active donors are sorted by distance from the selected blood request."
        emptyRequestsMessage="No pending blood requests are available for donor search."
        showSettingsButton
        onSettingsClick={() => navigate("/settings?tab=system_settings&section=auto_matching")}
      />
    </div>
  );
}
