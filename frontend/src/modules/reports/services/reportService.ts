import apiClient from "@/lib/api";

import type {
  CreateReportExportPayload,
  DonationAnalyticsResponse,
  EmergencyAnalysisResponse,
  GeographicDistanceResponse,
  HospitalPerformanceResponse,
  PaginatedExportJobs,
  ReportExportJob,
  ReportsFilterParams,
  RequestAnalyticsResponse,
  SystemPerformanceResponse,
} from "../types/report.types";

export const reportService = {
  getRequestAnalytics: (params?: ReportsFilterParams) =>
    apiClient.get<RequestAnalyticsResponse>("/reports/request-analytics/", { params }),

  getDonationAnalytics: (params?: ReportsFilterParams) =>
    apiClient.get<DonationAnalyticsResponse>("/reports/donation-analytics/", { params }),

  getHospitalPerformance: (params?: ReportsFilterParams) =>
    apiClient.get<HospitalPerformanceResponse>("/reports/hospital-performance/", { params }),

  getEmergencyAnalysis: (params?: ReportsFilterParams) =>
    apiClient.get<EmergencyAnalysisResponse>("/reports/emergency-analysis/", { params }),

  getGeographicDistance: (params?: ReportsFilterParams) =>
    apiClient.get<GeographicDistanceResponse>("/reports/geographic-distance/", { params }),

  getSystemPerformance: (params?: ReportsFilterParams) =>
    apiClient.get<SystemPerformanceResponse>("/reports/system-performance/", { params }),

  createExport: (payload: CreateReportExportPayload) =>
    apiClient.post<ReportExportJob>("/reports/exports/", payload),

  getExportJobs: (params?: { page?: number; page_size?: number }) =>
    apiClient.get<PaginatedExportJobs>("/reports/exports/", { params }),

  getExportJob: (id: number) => apiClient.get<ReportExportJob>(`/reports/exports/${id}/`),

  downloadExport: (id: number) =>
    apiClient.get<Blob>(`/reports/exports/${id}/download/`, {
      responseType: "blob" as const,
    }),
};
