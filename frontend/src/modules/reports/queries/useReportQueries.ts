import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

import { extractAxiosError } from "@/utils/extractError";
import { reportService } from "../services/reportService";
import type { ReportsFilterParams } from "../types/report.types";
import { reportKeys } from "./reportKeys";

const freshReportQueryOptions = {
  staleTime: 0,
  gcTime: 0,
  refetchOnMount: "always" as const,
  refetchOnWindowFocus: true,
};

export const useRequestAnalytics = (params: ReportsFilterParams, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: reportKeys.requestAnalytics(params),
    queryFn: () => reportService.getRequestAnalytics(params).then((res) => res.data),
    enabled: options?.enabled ?? true,
    ...freshReportQueryOptions,
  });

export const useDonationAnalytics = (params: ReportsFilterParams, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: reportKeys.donationAnalytics(params),
    queryFn: () => reportService.getDonationAnalytics(params).then((res) => res.data),
    enabled: options?.enabled ?? true,
    ...freshReportQueryOptions,
  });

export const useHospitalPerformance = (params: ReportsFilterParams, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: reportKeys.hospitalPerformance(params),
    queryFn: () => reportService.getHospitalPerformance(params).then((res) => res.data),
    enabled: options?.enabled ?? true,
    ...freshReportQueryOptions,
  });

export const useEmergencyAnalysis = (params: ReportsFilterParams, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: reportKeys.emergencyAnalysis(params),
    queryFn: () => reportService.getEmergencyAnalysis(params).then((res) => res.data),
    enabled: options?.enabled ?? true,
    ...freshReportQueryOptions,
  });

export const useGeographicDistance = (params: ReportsFilterParams, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: reportKeys.geographicDistance(params),
    queryFn: () => reportService.getGeographicDistance(params).then((res) => res.data),
    enabled: options?.enabled ?? true,
    ...freshReportQueryOptions,
  });

export const useSystemPerformance = (params: ReportsFilterParams, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: reportKeys.systemPerformance(params),
    queryFn: () => reportService.getSystemPerformance(params).then((res) => res.data),
    enabled: options?.enabled ?? true,
    ...freshReportQueryOptions,
  });

export const useDownloadManagementReportPdf = () =>
  useMutation({
    mutationFn: async () => {
      const response = await reportService.downloadManagementReportPdf();
      const blobUrl = URL.createObjectURL(response.data);
      const filename = `blood-donation-management-report-${new Date().toISOString().slice(0, 10)}.pdf`;
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(blobUrl);
    },
    onSuccess: () => {
      toast.success("Report downloaded");
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, "Failed to download report"));
    },
  });
