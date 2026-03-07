export const REPORT_TABS = [
  "requests",
  "donations",
  "hospitals",
  "emergency",
  "geography",
  "system",
] as const;

export type ReportTab = (typeof REPORT_TABS)[number];

export type ReportGroupBy = "day" | "week" | "month";

export interface ReportsFilterParams {
  date_from?: string;
  date_to?: string;
  group_by?: ReportGroupBy;
  hospital_id?: number;
  city?: string;
  blood_group?: string;
  request_type?: string;
  priority?: string;
  emergency_only?: boolean;
  status?: string;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
  cache?: "true" | "false";
}

export interface ReportCacheMeta {
  from_cache: boolean;
  ttl_seconds: number;
}

export interface RequestAnalyticsResponse {
  summary: {
    total_requests: number;
    status_counts: Record<string, number>;
    completion_rate: number;
    avg_match_time_minutes: number | null;
    avg_completion_time_minutes: number | null;
    overdue_pending_count: number;
  };
  trends: Array<{ bucket: string | null; total: number }>;
  breakdowns: {
    blood_group: Array<{ blood_group: string; count: number }>;
    request_type: Array<{ request_type: string; count: number }>;
    priority: Array<{ priority: string; count: number }>;
  };
  meta: Record<string, unknown>;
  cache: ReportCacheMeta;
}

export interface DonationAnalyticsResponse {
  summary: {
    total_donations: number;
    status_counts: Record<string, number>;
    response_rate: number;
    acceptance_rate: number;
    completion_rate: number;
    avg_response_time_minutes: number | null;
    median_response_time_minutes: number | null;
    avg_eta_minutes: number | null;
    avg_distance_km: number | null;
    reminder_conversion_rate: number;
  };
  trends: Array<{ bucket: string | null; total: number }>;
  distributions: {
    distance_buckets: Array<{ label: string; count: number; percentage: number }>;
    response_time_buckets: Array<{ label: string; count: number; percentage: number }>;
  };
  meta: Record<string, unknown>;
  cache: ReportCacheMeta;
}

export interface HospitalPerformanceRow {
  hospital_id: number;
  hospital_name: string;
  city: string;
  request_volume: number;
  emergency_share: number;
  completion_rate: number;
  cancellation_rate: number;
  avg_match_time_minutes: number | null;
  avg_completion_time_minutes: number | null;
  avg_donation_distance_km: number | null;
  avg_donation_response_time_minutes: number | null;
}

export interface HospitalPerformanceResponse {
  summary: {
    hospitals_count: number;
    total_requests: number;
    avg_completion_rate: number | null;
  };
  rows: HospitalPerformanceRow[];
  pagination?: {
    count: number;
    next: string | null;
    previous: string | null;
  };
  meta: Record<string, unknown>;
  cache: ReportCacheMeta;
}

export interface EmergencyAnalysisResponse {
  summary: {
    total_emergency_requests: number;
    urgent_requests: number;
    critical_requests: number;
    completion_rate: number;
    overdue_pending_count: number;
    avg_first_response_time_minutes: number | null;
    avg_match_time_minutes: number | null;
    avg_completion_time_minutes: number | null;
  };
  delay_buckets: Array<{ label: string; count: number; percentage: number }>;
  top_bottlenecks: Array<{ reason: string; count: number }>;
  meta: Record<string, unknown>;
  cache: ReportCacheMeta;
}

export interface GeographicDistanceResponse {
  summary: {
    total_donations: number;
    avg_distance_km: number | null;
    max_distance_km: number | null;
    avg_eta_minutes: number | null;
    coverage_gap_count: number;
  };
  distance_bands: Array<{ label: string; count: number; percentage: number }>;
  eta_by_distance_band: Array<{ label: string; avg_eta_minutes: number | null }>;
  city_distribution: Array<{ city: string; count: number }>;
  hospital_distribution: Array<{ hospital_id: number; hospital_name: string; count: number }>;
  farthest_cases: Array<{
    donation_id: number;
    request_id: number;
    donor_id: number;
    donor_name: string;
    hospital_name: string;
    city: string;
    distance_km: number;
    estimated_arrival_time: number | null;
    status: string;
  }>;
  farthest_cases_pagination?: {
    count: number;
    next: string | null;
    previous: string | null;
  };
  meta: Record<string, unknown>;
  cache: ReportCacheMeta;
}

export interface SystemPerformanceResponse {
  summary: {
    total_notifications: number;
    delivered_rate: number;
    failed_rate: number;
    queued_notifications: number;
    retryable_failed_notifications: number;
    reminder_activity_count: number;
    pending_response_backlog: number;
    auto_match_enabled_rate: number;
  };
  data_quality: {
    donors_missing_coordinates: number;
    hospitals_missing_coordinates: number;
    requests_missing_response_deadline: number;
  };
  failed_events: Array<{ event_key: string; count: number }>;
  failed_events_pagination?: {
    count: number;
    next: string | null;
    previous: string | null;
  };
  notification_trend: Array<{ bucket: string | null; status: string; count: number }>;
  pending_backlog_trend: Array<{ bucket: string | null; count: number }>;
  meta: Record<string, unknown>;
  cache: ReportCacheMeta;
}

export interface ReportExportJob {
  id: number;
  owner_id: number;
  report_type:
    | "request_analytics"
    | "donation_analytics"
    | "hospital_performance"
    | "emergency_analysis"
    | "geographic_distance"
    | "system_performance";
  file_format: "csv" | "pdf";
  status: "queued" | "processing" | "completed" | "failed" | "expired";
  filters: Record<string, unknown>;
  include_sections: string[];
  artifact_url: string | null;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  expires_at: string | null;
  row_count: number | null;
  created_at: string;
  updated_at: string;
}

export interface PaginatedExportJobs {
  count: number;
  next: string | null;
  previous: string | null;
  results: ReportExportJob[];
}

export interface CreateReportExportPayload {
  report_type: ReportExportJob["report_type"];
  format: ReportExportJob["file_format"];
  filters?: ReportsFilterParams;
  include_sections?: string[];
}
