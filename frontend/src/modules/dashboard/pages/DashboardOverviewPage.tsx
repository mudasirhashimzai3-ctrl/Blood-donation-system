import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui";
import DashboardAccessNotice from "../components/DashboardAccessNotice";
import DashboardChartPanel from "../components/DashboardChartPanel";
import DashboardFilterBar from "../components/DashboardFilterBar";
import DashboardHeader from "../components/DashboardHeader";
import DashboardKpiGrid from "../components/DashboardKpiGrid";
import DashboardStatisticsStrip from "../components/DashboardStatisticsStrip";
import { useDashboardFilters } from "../hooks/useDashboardFilters";
import { useDashboardNavigation } from "../hooks/useDashboardNavigation";
import { useDashboardOverview } from "../queries/useDashboardQueries";
import type { DashboardAccess, DashboardKpis, DashboardStatistics } from "../types/dashboard.types";

const PIE_COLORS = ["#0B7A4B", "#66BB4A", "#F4CC0B", "#DC2626"];
const ACTIVE_REQUEST_STATUSES = new Set(["pending", "matched"]);
type DashboardUiState = "ready" | "loading" | "error";

const EMPTY_KPIS: DashboardKpis = {
  total_donors: null,
  total_recipients: null,
  active_requests: null,
  completed_donations: null,
};

const EMPTY_ACCESS: DashboardAccess = {
  donors: false,
  recipients: false,
  blood_requests: false,
  donations: false,
};

const EMPTY_STATISTICS: DashboardStatistics = {
  request_completion_rate: null,
  donation_completion_rate: null,
  avg_donation_response_time_minutes: null,
};

const formatBucket = (bucket: string | null) => {
  if (!bucket) {
    return "-";
  }
  return bucket.slice(0, 10);
};

const renderChartLoading = () => (
  <Card variant="outlined" className="h-full">
    <CardContent className="mt-0 flex h-full items-center justify-center">
      <div className="w-full animate-pulse space-y-3 px-2">
        <div className="h-3 w-1/3 rounded bg-surface-hover" />
        <div className="h-40 rounded bg-surface-hover" />
      </div>
    </CardContent>
  </Card>
);

const renderChartError = () => (
  <Card variant="outlined" className="h-full">
    <CardContent className="mt-0 flex h-full items-center justify-center text-sm text-text-secondary">
      Data unavailable. Please refresh and try again.
    </CardContent>
  </Card>
);

const renderChartEmpty = (message: string) => (
  <Card variant="outlined" className="h-full">
    <CardContent className="mt-0 flex h-full items-center justify-center text-sm text-text-secondary">{message}</CardContent>
  </Card>
);

const renderChartContent = <T,>({
  data,
  state,
  restrictedMessage,
  emptyMessage,
  renderReady,
}: {
  data: T[] | null | undefined;
  state: DashboardUiState;
  restrictedMessage: string;
  emptyMessage: string;
  renderReady: (rows: T[]) => ReactNode;
}) => {
  if (data === null) {
    return <DashboardAccessNotice message={restrictedMessage} />;
  }
  if (state === "loading") {
    return renderChartLoading();
  }
  if (state === "error") {
    return renderChartError();
  }
  if (!data || data.length === 0) {
    return renderChartEmpty(emptyMessage);
  }
  return renderReady(data);
};

export default function DashboardOverviewPage() {
  const {
    dateFrom,
    dateTo,
    groupBy,
    setDateFrom,
    setDateTo,
    setGroupBy,
    resetFilters,
    queryParams,
  } = useDashboardFilters();
  const dashboardQuery = useDashboardOverview(queryParams);
  const { goToDonors, goToRecipients, goToRequests, goToActiveRequests, goToDonations } =
    useDashboardNavigation();
  const dashboardData = dashboardQuery.data;
  const uiState: DashboardUiState = dashboardData ? "ready" : dashboardQuery.error ? "error" : "loading";
  const charts = dashboardData?.charts;
  const kpis = dashboardData?.kpis ?? EMPTY_KPIS;
  const access = dashboardData?.access ?? EMPTY_ACCESS;
  const statistics = dashboardData?.statistics ?? EMPTY_STATISTICS;

  return (
    <div className="space-y-6">
      <DashboardHeader onRefresh={() => void dashboardQuery.refetch()} refreshing={dashboardQuery.isFetching} />

      <DashboardFilterBar
        dateFrom={dateFrom}
        dateTo={dateTo}
        groupBy={groupBy}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        onGroupByChange={setGroupBy}
        onReset={resetFilters}
      />

      <div className="space-y-4">
        <DashboardKpiGrid
          kpis={kpis}
          state={uiState}
          onTotalDonorsClick={() => goToDonors()}
          onTotalRecipientsClick={goToRecipients}
          onActiveRequestsClick={() => goToActiveRequests()}
          onCompletedDonationsClick={() => goToDonations("completed")}
        />

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <DashboardChartPanel title="Request Status Distribution" subtitle="Click a segment to drill down">
            {renderChartContent({
              data: charts?.requests_status_distribution,
              state: uiState,
              restrictedMessage: "Request distribution is restricted for your account.",
              emptyMessage: "No request status data in selected range.",
              renderReady: (rows) => (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={rows}
                      dataKey="count"
                      nameKey="status"
                      outerRadius={90}
                      onClick={((entry: any) => {
                        const status = entry?.status ?? entry?.payload?.status;
                        if (!status) return;
                        const activeOnly = ACTIVE_REQUEST_STATUSES.has(status) ? true : null;
                        goToRequests({ status, activeOnly });
                      }) as any}
                    >
                      {rows.map((_, index) => (
                        <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ),
            })}
          </DashboardChartPanel>

          <DashboardChartPanel title="Donations Trend" subtitle="Completed vs cancelled over time">
            {renderChartContent({
              data: charts?.donations_trend,
              state: uiState,
              restrictedMessage: "Donation trends are restricted for your account.",
              emptyMessage: "No donation trend data in selected range.",
              renderReady: (rows) => (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={rows}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="bucket" tickFormatter={formatBucket} />
                    <YAxis />
                    <Tooltip labelFormatter={(value) => formatBucket(String(value))} />
                    <Legend />
                    <Bar dataKey="completed" fill="var(--color-success)" onClick={() => goToDonations("completed")} />
                    <Bar dataKey="cancelled" fill="var(--color-error)" onClick={() => goToDonations("cancelled")} />
                  </BarChart>
                </ResponsiveContainer>
              ),
            })}
          </DashboardChartPanel>

          <DashboardChartPanel title="Blood Group Supply vs Demand" subtitle="Click bars for filtered drill-down">
            {renderChartContent({
              data: charts?.blood_group_supply_vs_demand,
              state: uiState,
              restrictedMessage: "Supply and demand chart is restricted for your account.",
              emptyMessage: "No supply and demand data available.",
              renderReady: (rows) => (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={rows}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="blood_group" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar
                      dataKey="donors"
                      fill="var(--color-primary)"
                      onClick={((entry: any) => {
                        const bloodGroup = entry?.payload?.blood_group;
                        if (!bloodGroup) return;
                        goToDonors(bloodGroup);
                      }) as any}
                    />
                    <Bar
                      dataKey="active_requests"
                      fill="var(--color-warning)"
                      onClick={((entry: any) => {
                        const bloodGroup = entry?.payload?.blood_group;
                        if (!bloodGroup) return;
                        goToActiveRequests({ bloodGroup });
                      }) as any}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ),
            })}
          </DashboardChartPanel>
        </div>

        <DashboardStatisticsStrip statistics={statistics} access={access} state={uiState} />
      </div>
    </div>
  );
}
