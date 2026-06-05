import { Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { PageHeader } from "@/components";
import { Button, Card, CardContent } from "@components/ui";
import DashboardCharts from "../components/DashboardCharts";
import DashboardStatsGrid from "../components/DashboardStatsGrid";
import DonorCandidateTable from "../components/DonorCandidateTable";
import DonorSearchFilters from "../components/DonorSearchFilters";
import { useDashboardDonorSearch } from "../hooks/useDashboardDonorSearch";
import {
  useDashboardActiveRequests,
  useDashboardDonorCandidates,
  useDashboardSummary,
} from "../queries/useDashboardQueries";

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const summaryQuery = useDashboardSummary();
  const requestsQuery = useDashboardActiveRequests();
  const activeRequests = requestsQuery.data?.results ?? [];
  const search = useDashboardDonorSearch(activeRequests);
  const candidatesQuery = useDashboardDonorCandidates(search.queryParams, {
    enabled: Boolean(search.queryParams.blood_request_id),
  });

  const candidates = candidatesQuery.data?.results ?? [];
  const totalCandidates = candidatesQuery.data?.count ?? 0;

  return (
    <div className="space-y-6">
     
      <PageHeader
        title="Admin Dashboard"
        subtitle="Monitor blood donation activity and find eligible nearby donors"
        actions={[
          {
            label: "Notification Radius",
            icon: <Settings className="h-4 w-4" />,
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

      <Card>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-base font-semibold text-text-primary">Advanced Donor Search</h2>
              <p className="text-sm text-text-secondary">
                Compatible donors are sorted by distance from the selected blood request.
              </p>
            </div>
            <Button
              variant="outline"
              onClick={() => navigate("/settings?tab=system_settings&section=auto_matching")}
              leftIcon={<Settings className="h-4 w-4" />}
            >
              Configure Radius
            </Button>
          </div>

          {requestsQuery.isLoading ? (
            <p className="text-sm text-text-secondary">Loading active blood requests...</p>
          ) : null}

          {!requestsQuery.isLoading && activeRequests.length === 0 ? (
            <p className="rounded-lg border border-border bg-surface p-4 text-sm text-text-secondary">
              No pending blood requests are available for donor search.
            </p>
          ) : (
            <DonorSearchFilters
              requests={activeRequests}
              bloodRequestId={search.bloodRequestId}
              bloodGroup={search.bloodGroup || search.selectedRequest?.blood_group || ""}
              radiusKm={search.radiusKm}
              onBloodRequestChange={search.setBloodRequestId}
              onBloodGroupChange={search.setBloodGroup}
              onRadiusChange={search.setRadiusKm}
              onReset={search.reset}
            />
          )}
        </CardContent>
      </Card>

      {candidatesQuery.error ? (
        <Card>
          <CardContent className="text-sm text-error">Failed to load donor candidates.</CardContent>
        </Card>
      ) : null}

      <DonorCandidateTable
        donors={candidates}
        isLoading={candidatesQuery.isLoading || candidatesQuery.isFetching}
        totalCount={totalCandidates}
        page={search.page}
        pageSize={search.pageSize}
        onPageChange={search.setPage}
      />
    </div>
  );
}
