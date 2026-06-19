import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { Card, CardContent } from "@/components/ui";
import type {
  DonationAnalyticsResponse,
  EmergencyAnalysisResponse,
  GeographicDistanceResponse,
  HospitalPerformanceResponse,
  RequestAnalyticsResponse,
  ReportTab,
  SystemPerformanceResponse,
} from "../types/report.types";
import ReportChartCard from "./ReportChartCard";
import ReportEmptyState from "./ReportEmptyState";
import ReportErrorState from "./ReportErrorState";
import ReportSkeleton from "./ReportSkeleton";
import ReportsKpiGrid from "./ReportsKpiGrid";

interface ReportsTabPanelsProps {
  activeTab: ReportTab;
  request: { data?: RequestAnalyticsResponse; isLoading: boolean; error: unknown; refetch: () => void };
  donation: { data?: DonationAnalyticsResponse; isLoading: boolean; error: unknown; refetch: () => void };
  hospital: { data?: HospitalPerformanceResponse; isLoading: boolean; error: unknown; refetch: () => void };
  emergency: { data?: EmergencyAnalysisResponse; isLoading: boolean; error: unknown; refetch: () => void };
  geography: { data?: GeographicDistanceResponse; isLoading: boolean; error: unknown; refetch: () => void };
  system: { data?: SystemPerformanceResponse; isLoading: boolean; error: unknown; refetch: () => void };
  onResetFilters: () => void;
}

function StatusCountsChart({ counts }: { counts: Record<string, number> }) {
  const data = Object.entries(counts).map(([name, value]) => ({ name, value }));
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" outerRadius={90} fill="var(--color-primary)" />
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}

function TrendChart({ data }: { data: Array<{ bucket: string | null; total: number }> }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="bucket" tick={{ fontSize: 11 }} />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="total" stroke="var(--color-primary)" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function renderState(
  state: { isLoading: boolean; error: unknown; refetch: () => void },
  children: ReactNode,
  errorMessage: string
) {
  if (state.isLoading) {
    return <ReportSkeleton />;
  }
  if (state.error) {
    return (
      <ReportErrorState message={errorMessage} onRetry={state.refetch} />
    );
  }
  return <>{children}</>;
}

export default function ReportsTabPanels({
  activeTab,
  request,
  donation,
  hospital,
  emergency,
  geography,
  system,
  onResetFilters,
}: ReportsTabPanelsProps) {
  const { t } = useTranslation();
  const errorMessage = t("reports.errors.loadFailedRetry", "The report data could not be loaded. Please retry.");

  if (activeTab === "requests") {
    return renderState(
      request,
    request.data ? (
        <div className="space-y-4">
          <ReportsKpiGrid
            items={[
              { label: t("reports.kpi.totalRequests", "Total Requests"), value: request.data.summary.total_requests },
              { label: t("reports.kpi.completionRate", "Completion Rate"), value: `${request.data.summary.completion_rate}%` },
              { label: t("reports.kpi.avgMatch", "Avg Match"), value: `${request.data.summary.avg_match_time_minutes ?? "-"}m` },
              { label: t("reports.kpi.overduePending", "Overdue Pending"), value: request.data.summary.overdue_pending_count },
            ]}
          />
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <ReportChartCard
              title={t("reports.charts.requestVolumeTrend", "Request Volume Trend")}
              subtitle={t("reports.charts.groupedByInterval", "Grouped by selected interval")}
            >
              <TrendChart data={request.data.trends} />
            </ReportChartCard>
            <ReportChartCard title={t("reports.charts.requestStatusDistribution", "Request Status Distribution")}>
              <StatusCountsChart counts={request.data.summary.status_counts} />
            </ReportChartCard>
          </div>
        </div>
      ) : (
        <ReportEmptyState message={t("reports.empty.requests", "No request analytics found for selected filters.")} onReset={onResetFilters} />
      ),
      errorMessage
    );
  }

  if (activeTab === "donations") {
    return renderState(
      donation,
      donation.data ? (
        <div className="space-y-4">
          <ReportsKpiGrid
            items={[
              { label: t("reports.kpi.totalDonations", "Total Donations"), value: donation.data.summary.total_donations },
              { label: t("reports.kpi.responseRate", "Response Rate"), value: `${donation.data.summary.response_rate}%` },
              { label: t("reports.kpi.completionRate", "Completion Rate"), value: `${donation.data.summary.completion_rate}%` },
              { label: t("reports.kpi.avgDistance", "Avg Distance"), value: `${donation.data.summary.avg_distance_km ?? "-"} km` },
            ]}
          />
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <ReportChartCard title={t("reports.charts.donationTrend", "Donation Trend")}>
              <TrendChart data={donation.data.trends} />
            </ReportChartCard>
            <ReportChartCard title={t("reports.charts.distanceBuckets", "Distance Buckets")}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={donation.data.distributions.distance_buckets}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="var(--color-primary)" />
                </BarChart>
              </ResponsiveContainer>
            </ReportChartCard>
          </div>
        </div>
      ) : (
        <ReportEmptyState message={t("reports.empty.donations", "No donation analytics found for selected filters.")} onReset={onResetFilters} />
      ),
      errorMessage
    );
  }

  if (activeTab === "hospitals") {
    return renderState(
      hospital,
      hospital.data ? (
        <div className="space-y-4">
          <ReportsKpiGrid
            items={[
              { label: t("reports.kpi.hospitals", "Hospitals"), value: hospital.data.summary.hospitals_count },
              { label: t("reports.kpi.totalRequests", "Total Requests"), value: hospital.data.summary.total_requests },
              { label: t("reports.kpi.avgCompletion", "Avg Completion"), value: `${hospital.data.summary.avg_completion_rate ?? 0}%` },
              {
                label: t("reports.kpi.rows", "Rows"),
                value: hospital.data.pagination?.count ?? hospital.data.rows.length,
              },
            ]}
          />
          <Card>
            <CardContent className="mt-0 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-text-secondary">
                    <th className="px-3 py-2">{t("reports.table.hospital", "Hospital")}</th>
                    <th className="px-3 py-2">{t("reports.table.city", "City")}</th>
                    <th className="px-3 py-2">{t("reports.table.requests", "Requests")}</th>
                    <th className="px-3 py-2">{t("reports.table.completion", "Completion")}</th>
                    <th className="px-3 py-2">{t("reports.table.avgDistance", "Avg Distance")}</th>
                  </tr>
                </thead>
                <tbody>
                  {hospital.data.rows.map((row) => (
                    <tr key={row.hospital_id} className="border-b border-border/60">
                      <td className="px-3 py-2">{row.hospital_name}</td>
                      <td className="px-3 py-2">{row.city}</td>
                      <td className="px-3 py-2">{row.request_volume}</td>
                      <td className="px-3 py-2">{row.completion_rate}%</td>
                      <td className="px-3 py-2">{row.avg_donation_distance_km ?? "-"} km</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      ) : (
        <ReportEmptyState message={t("reports.empty.hospitals", "No hospital performance records found.")} onReset={onResetFilters} />
      ),
      errorMessage
    );
  }

  if (activeTab === "emergency") {
    return renderState(
      emergency,
      emergency.data ? (
        <div className="space-y-4">
           <ReportsKpiGrid
             items={[
               { label: t("reports.kpi.emergencyRequests", "Emergency Requests"), value: emergency.data.summary.total_emergency_requests },
               { label: t("reports.kpi.critical", "Critical"), value: emergency.data.summary.critical_requests },
               { label: t("reports.kpi.completion", "Completion"), value: `${emergency.data.summary.completion_rate}%` },
               { label: t("reports.kpi.overdue", "Overdue"), value: emergency.data.summary.overdue_pending_count },
             ]}
           />
        </div>
      ) : (
        <ReportEmptyState message={t("reports.empty.emergency", "No emergency analytics found.")} onReset={onResetFilters} />
      ),
      errorMessage
    );
  }

  if (activeTab === "geography") {
    return renderState(
      geography,
      geography.data ? (
        <div className="space-y-4">
          <ReportsKpiGrid
            items={[
              { label: t("reports.kpi.totalDonations", "Total Donations"), value: geography.data.summary.total_donations },
              { label: t("reports.kpi.avgDistance", "Avg Distance"), value: `${geography.data.summary.avg_distance_km ?? "-"} km` },
              { label: t("reports.kpi.maxDistance", "Max Distance"), value: `${geography.data.summary.max_distance_km ?? "-"} km` },
              { label: t("reports.kpi.coverageGaps", "Coverage Gaps"), value: geography.data.summary.coverage_gap_count },
            ]}
          />
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <ReportChartCard title={t("reports.charts.distanceBandCoverage", "Distance Band Coverage")}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={geography.data.distance_bands}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="var(--color-info)" />
                </BarChart>
              </ResponsiveContainer>
            </ReportChartCard>
            <ReportChartCard title={t("reports.charts.cityDistribution", "City Distribution")}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={geography.data.city_distribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="city" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="var(--color-primary)" />
                </BarChart>
              </ResponsiveContainer>
            </ReportChartCard>
          </div>
        </div>
      ) : (
        <ReportEmptyState message={t("reports.empty.geography", "No geographic analytics found.")} onReset={onResetFilters} />
      ),
      errorMessage
    );
  }

  return renderState(
    system,
    system.data ? (
      <div className="space-y-4">
        <ReportsKpiGrid
          items={[
            { label: t("reports.kpi.notifications", "Notifications"), value: system.data.summary.total_notifications },
            { label: t("reports.kpi.delivered", "Delivered"), value: `${system.data.summary.delivered_rate}%` },
            { label: t("reports.kpi.failed", "Failed"), value: `${system.data.summary.failed_rate}%` },
            { label: t("reports.kpi.backlog", "Backlog"), value: system.data.summary.pending_response_backlog },
          ]}
        />
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <ReportChartCard title={t("reports.charts.pendingBacklogTrend", "Pending Backlog Trend")}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={system.data.pending_backlog_trend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="bucket" tick={{ fontSize: 11 }} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="count" stroke="var(--color-error)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </ReportChartCard>
          <ReportChartCard title={t("reports.charts.failedNotificationEvents", "Failed Notification Events")}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={system.data.failed_events}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="event_key" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="var(--color-error)" />
              </BarChart>
            </ResponsiveContainer>
          </ReportChartCard>
        </div>
      </div>
    ) : (
      <ReportEmptyState message={t("reports.empty.system", "No system analytics found.")} onReset={onResetFilters} />
    ),
    errorMessage
  );
}
