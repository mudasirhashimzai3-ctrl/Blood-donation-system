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
  children: ReactNode
) {
  if (state.isLoading) {
    return <ReportSkeleton />;
  }
  if (state.error) {
    return (
      <ReportErrorState message="The report data could not be loaded. Please retry." onRetry={state.refetch} />
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
  if (activeTab === "requests") {
    return renderState(
      request,
    request.data ? (
        <div className="space-y-4">
          <ReportsKpiGrid
            items={[
              { label: "Total Requests", value: request.data.summary.total_requests },
              { label: "Completion Rate", value: `${request.data.summary.completion_rate}%` },
              { label: "Avg Match", value: `${request.data.summary.avg_match_time_minutes ?? "-"}m` },
              { label: "Overdue Pending", value: request.data.summary.overdue_pending_count },
            ]}
          />
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <ReportChartCard title="Request Volume Trend" subtitle="Grouped by selected interval">
              <TrendChart data={request.data.trends} />
            </ReportChartCard>
            <ReportChartCard title="Request Status Distribution">
              <StatusCountsChart counts={request.data.summary.status_counts} />
            </ReportChartCard>
          </div>
        </div>
      ) : (
        <ReportEmptyState message="No request analytics found for selected filters." onReset={onResetFilters} />
      )
    );
  }

  if (activeTab === "donations") {
    return renderState(
      donation,
      donation.data ? (
        <div className="space-y-4">
          <ReportsKpiGrid
            items={[
              { label: "Total Donations", value: donation.data.summary.total_donations },
              { label: "Response Rate", value: `${donation.data.summary.response_rate}%` },
              { label: "Completion Rate", value: `${donation.data.summary.completion_rate}%` },
              { label: "Avg Distance", value: `${donation.data.summary.avg_distance_km ?? "-"} km` },
            ]}
          />
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <ReportChartCard title="Donation Trend">
              <TrendChart data={donation.data.trends} />
            </ReportChartCard>
            <ReportChartCard title="Distance Buckets">
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
        <ReportEmptyState message="No donation analytics found for selected filters." onReset={onResetFilters} />
      )
    );
  }

  if (activeTab === "hospitals") {
    return renderState(
      hospital,
      hospital.data ? (
        <div className="space-y-4">
          <ReportsKpiGrid
            items={[
              { label: "Hospitals", value: hospital.data.summary.hospitals_count },
              { label: "Total Requests", value: hospital.data.summary.total_requests },
              { label: "Avg Completion", value: `${hospital.data.summary.avg_completion_rate ?? 0}%` },
              {
                label: "Rows",
                value: hospital.data.pagination?.count ?? hospital.data.rows.length,
              },
            ]}
          />
          <Card>
            <CardContent className="mt-0 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-text-secondary">
                    <th className="px-3 py-2">Hospital</th>
                    <th className="px-3 py-2">City</th>
                    <th className="px-3 py-2">Requests</th>
                    <th className="px-3 py-2">Completion</th>
                    <th className="px-3 py-2">Avg Distance</th>
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
        <ReportEmptyState message="No hospital performance records found." onReset={onResetFilters} />
      )
    );
  }

  if (activeTab === "emergency") {
    return renderState(
      emergency,
      emergency.data ? (
        <div className="space-y-4">
          <ReportsKpiGrid
            items={[
              { label: "Emergency Requests", value: emergency.data.summary.total_emergency_requests },
              { label: "Critical", value: emergency.data.summary.critical_requests },
              { label: "Completion", value: `${emergency.data.summary.completion_rate}%` },
              { label: "Overdue", value: emergency.data.summary.overdue_pending_count },
            ]}
          />
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <ReportChartCard title="Emergency Delay Buckets">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={emergency.data.delay_buckets}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="var(--color-primary)" />
                </BarChart>
              </ResponsiveContainer>
            </ReportChartCard>
            <ReportChartCard title="Top Bottlenecks">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={emergency.data.top_bottlenecks} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="reason" type="category" width={120} />
                  <Tooltip />
                  <Bar dataKey="count" fill="var(--color-warning)" />
                </BarChart>
              </ResponsiveContainer>
            </ReportChartCard>
          </div>
        </div>
      ) : (
        <ReportEmptyState message="No emergency analytics found." onReset={onResetFilters} />
      )
    );
  }

  if (activeTab === "geography") {
    return renderState(
      geography,
      geography.data ? (
        <div className="space-y-4">
          <ReportsKpiGrid
            items={[
              { label: "Total Donations", value: geography.data.summary.total_donations },
              { label: "Avg Distance", value: `${geography.data.summary.avg_distance_km ?? "-"} km` },
              { label: "Max Distance", value: `${geography.data.summary.max_distance_km ?? "-"} km` },
              { label: "Coverage Gaps", value: geography.data.summary.coverage_gap_count },
            ]}
          />
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <ReportChartCard title="Distance Band Coverage">
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
            <ReportChartCard title="City Distribution">
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
        <ReportEmptyState message="No geographic analytics found." onReset={onResetFilters} />
      )
    );
  }

  return renderState(
    system,
    system.data ? (
      <div className="space-y-4">
        <ReportsKpiGrid
          items={[
            { label: "Notifications", value: system.data.summary.total_notifications },
            { label: "Delivered", value: `${system.data.summary.delivered_rate}%` },
            { label: "Failed", value: `${system.data.summary.failed_rate}%` },
            { label: "Backlog", value: system.data.summary.pending_response_backlog },
          ]}
        />
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <ReportChartCard title="Pending Backlog Trend">
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
          <ReportChartCard title="Failed Notification Events">
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
      <ReportEmptyState message="No system analytics found." onReset={onResetFilters} />
    )
  );
}
