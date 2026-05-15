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
};
