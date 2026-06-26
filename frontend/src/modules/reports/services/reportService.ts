import apiClient from "@/lib/api";

import type {
  DonationAnalyticsResponse,
  EmergencyAnalysisResponse,
  GeographicDistanceResponse,
  HospitalPerformanceResponse,
  ReportsFilterParams,
  RequestAnalyticsResponse,
  SystemPerformanceResponse,
} from "../types/report.types";

const withFreshReportParams = (params?: ReportsFilterParams): ReportsFilterParams => ({
  ...params,
  cache: "false",
});

export const reportService = {
  getRequestAnalytics: (params?: ReportsFilterParams) =>
    apiClient.get<RequestAnalyticsResponse>("/reports/request-analytics/", { params: withFreshReportParams(params) }),

  getDonationAnalytics: (params?: ReportsFilterParams) =>
    apiClient.get<DonationAnalyticsResponse>("/reports/donation-analytics/", { params: withFreshReportParams(params) }),

  getHospitalPerformance: (params?: ReportsFilterParams) =>
    apiClient.get<HospitalPerformanceResponse>("/reports/hospital-performance/", { params: withFreshReportParams(params) }),

  getEmergencyAnalysis: (params?: ReportsFilterParams) =>
    apiClient.get<EmergencyAnalysisResponse>("/reports/emergency-analysis/", { params: withFreshReportParams(params) }),

  getGeographicDistance: (params?: ReportsFilterParams) =>
    apiClient.get<GeographicDistanceResponse>("/reports/geographic-distance/", { params: withFreshReportParams(params) }),

  getSystemPerformance: (params?: ReportsFilterParams) =>
    apiClient.get<SystemPerformanceResponse>("/reports/system-performance/", { params: withFreshReportParams(params) }),

  downloadManagementReportPdf: () =>
    apiClient.get<Blob>("/reports/management-summary/pdf/", {
      responseType: "blob",
      timeout: 120_000,
    }),
};
