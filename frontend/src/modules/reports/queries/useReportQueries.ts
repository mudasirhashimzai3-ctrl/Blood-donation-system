import { useQuery } from "@tanstack/react-query";

import { reportService } from "../services/reportService";
import type { ReportsFilterParams } from "../types/report.types";
import { reportKeys } from "./reportKeys";

export const useRequestAnalytics = (params: ReportsFilterParams, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: reportKeys.requestAnalytics(params),
    queryFn: () => reportService.getRequestAnalytics(params).then((res) => res.data),
    enabled: options?.enabled ?? true,
  });

export const useDonationAnalytics = (params: ReportsFilterParams, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: reportKeys.donationAnalytics(params),
    queryFn: () => reportService.getDonationAnalytics(params).then((res) => res.data),
    enabled: options?.enabled ?? true,
  });

export const useHospitalPerformance = (params: ReportsFilterParams, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: reportKeys.hospitalPerformance(params),
    queryFn: () => reportService.getHospitalPerformance(params).then((res) => res.data),
    enabled: options?.enabled ?? true,
  });

export const useEmergencyAnalysis = (params: ReportsFilterParams, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: reportKeys.emergencyAnalysis(params),
    queryFn: () => reportService.getEmergencyAnalysis(params).then((res) => res.data),
    enabled: options?.enabled ?? true,
  });

export const useGeographicDistance = (params: ReportsFilterParams, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: reportKeys.geographicDistance(params),
    queryFn: () => reportService.getGeographicDistance(params).then((res) => res.data),
    enabled: options?.enabled ?? true,
  });

export const useSystemPerformance = (params: ReportsFilterParams, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: reportKeys.systemPerformance(params),
    queryFn: () => reportService.getSystemPerformance(params).then((res) => res.data),
    enabled: options?.enabled ?? true,
  });
