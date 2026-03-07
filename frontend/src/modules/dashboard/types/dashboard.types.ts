export type DashboardGroupBy = "day" | "week" | "month";

export interface DashboardOverviewQueryParams {
  date_from?: string;
  date_to?: string;
  group_by?: DashboardGroupBy;
}

export interface DashboardAccess {
  donors: boolean;
  recipients: boolean;
  blood_requests: boolean;
  donations: boolean;
}

export interface DashboardKpiValue {
  value: number;
  href: string;
}

export interface DashboardKpis {
  total_donors: DashboardKpiValue | null;
  total_recipients: DashboardKpiValue | null;
  active_requests: DashboardKpiValue | null;
  completed_donations: DashboardKpiValue | null;
}

export interface DashboardRequestStatusDistributionItem {
  status: string;
  count: number;
  href: string;
}

export interface DashboardDonationTrendItem {
  bucket: string | null;
  completed: number;
  cancelled: number;
}

export interface DashboardBloodGroupSupplyDemandItem {
  blood_group: string;
  donors: number;
  active_requests: number;
}

export interface DashboardCharts {
  requests_status_distribution: DashboardRequestStatusDistributionItem[] | null;
  donations_trend: DashboardDonationTrendItem[] | null;
  blood_group_supply_vs_demand: DashboardBloodGroupSupplyDemandItem[] | null;
}

export interface DashboardStatistics {
  request_completion_rate: number | null;
  donation_completion_rate: number | null;
  avg_donation_response_time_minutes: number | null;
}

export interface DashboardCache {
  from_cache: boolean;
  ttl_seconds: number;
}

export interface DashboardOverviewResponse {
  generated_at: string;
  filters: {
    date_from: string;
    date_to: string;
    group_by: DashboardGroupBy;
  };
  access: DashboardAccess;
  kpis: DashboardKpis;
  charts: DashboardCharts;
  statistics: DashboardStatistics;
  cache: DashboardCache;
}
