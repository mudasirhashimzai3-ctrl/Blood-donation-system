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

import { Card, CardContent } from "@/components/ui";
import DashboardAccessNotice from "../components/DashboardAccessNotice";
import DashboardChartPanel from "../components/DashboardChartPanel";
import DashboardErrorState from "../components/DashboardErrorState";
import DashboardFilterBar from "../components/DashboardFilterBar";
import DashboardHeader from "../components/DashboardHeader";
import DashboardKpiGrid from "../components/DashboardKpiGrid";
import DashboardSkeleton from "../components/DashboardSkeleton";
import DashboardStatisticsStrip from "../components/DashboardStatisticsStrip";
import { useDashboardFilters } from "../hooks/useDashboardFilters";
import { useDashboardNavigation } from "../hooks/useDashboardNavigation";
import { useDashboardOverview } from "../queries/useDashboardQueries";

const PIE_COLORS = ["#0B7A4B", "#66BB4A", "#F4CC0B", "#DC2626"];
const ACTIVE_REQUEST_STATUSES = new Set(["pending", "matched"]);

const formatBucket = (bucket: string | null) => {
  if (!bucket) {
    return "-";
  }
  return bucket.slice(0, 10);
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

      {dashboardQuery.isLoading ? <DashboardSkeleton /> : null}

      {dashboardQuery.error ? <DashboardErrorState onRetry={() => void dashboardQuery.refetch()} /> : null}

      {!dashboardQuery.isLoading && !dashboardQuery.error && dashboardQuery.data ? (
        <div className="space-y-4">
          <DashboardKpiGrid
            kpis={dashboardQuery.data.kpis}
            onTotalDonorsClick={() => goToDonors()}
            onTotalRecipientsClick={goToRecipients}
            onActiveRequestsClick={() => goToActiveRequests()}
            onCompletedDonationsClick={() => goToDonations("completed")}
          />

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
            <DashboardChartPanel title="Request Status Distribution" subtitle="Click a segment to drill down">
              {dashboardQuery.data.charts.requests_status_distribution ? (
                dashboardQuery.data.charts.requests_status_distribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={dashboardQuery.data.charts.requests_status_distribution}
                        dataKey="count"
                        nameKey="status"
                        outerRadius={90}
                        onClick={(entry: { status?: string; payload?: { status?: string } }) => {
                          const status = entry?.status ?? entry?.payload?.status;
                          if (!status) return;
                          const activeOnly = ACTIVE_REQUEST_STATUSES.has(status) ? true : null;
                          goToRequests({ status, activeOnly });
                        }}
                      >
                        {dashboardQuery.data.charts.requests_status_distribution.map((_, index) => (
                          <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <Card variant="outlined" className="h-full">
                    <CardContent className="mt-0 flex h-full items-center justify-center text-sm text-text-secondary">
                      No request status data in selected range.
                    </CardContent>
                  </Card>
                )
              ) : (
                <DashboardAccessNotice message="Request distribution is restricted for your account." />
              )}
            </DashboardChartPanel>

            <DashboardChartPanel title="Donations Trend" subtitle="Completed vs cancelled over time">
              {dashboardQuery.data.charts.donations_trend ? (
                dashboardQuery.data.charts.donations_trend.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dashboardQuery.data.charts.donations_trend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="bucket" tickFormatter={formatBucket} />
                      <YAxis />
                      <Tooltip labelFormatter={(value) => formatBucket(String(value))} />
                      <Legend />
                      <Bar
                        dataKey="completed"
                        fill="var(--color-success)"
                        onClick={() => goToDonations("completed")}
                      />
                      <Bar
                        dataKey="cancelled"
                        fill="var(--color-error)"
                        onClick={() => goToDonations("cancelled")}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Card variant="outlined" className="h-full">
                    <CardContent className="mt-0 flex h-full items-center justify-center text-sm text-text-secondary">
                      No donation trend data in selected range.
                    </CardContent>
                  </Card>
                )
              ) : (
                <DashboardAccessNotice message="Donation trends are restricted for your account." />
              )}
            </DashboardChartPanel>

            <DashboardChartPanel title="Blood Group Supply vs Demand" subtitle="Click bars for filtered drill-down">
              {dashboardQuery.data.charts.blood_group_supply_vs_demand ? (
                dashboardQuery.data.charts.blood_group_supply_vs_demand.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dashboardQuery.data.charts.blood_group_supply_vs_demand}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="blood_group" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="donors"
                        fill="var(--color-primary)"
                        onClick={(state: any) => {
                          const bloodGroup = state?.payload?.blood_group;
                          if (!bloodGroup) return;
                          goToDonors(bloodGroup);
                        }}
                      />
                      <Bar
                        dataKey="active_requests"
                        fill="var(--color-warning)"
                        onClick={(state: any) => {
                          const bloodGroup = state?.payload?.blood_group;
                          if (!bloodGroup) return;
                          goToActiveRequests({ bloodGroup });
                        }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Card variant="outlined" className="h-full">
                    <CardContent className="mt-0 flex h-full items-center justify-center text-sm text-text-secondary">
                      No supply and demand data available.
                    </CardContent>
                  </Card>
                )
              ) : (
                <DashboardAccessNotice message="Supply and demand chart is restricted for your account." />
              )}
            </DashboardChartPanel>
          </div>

          <DashboardStatisticsStrip statistics={dashboardQuery.data.statistics} access={dashboardQuery.data.access} />
        </div>
      ) : null}
    </div>
  );
}
