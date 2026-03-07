import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { extractAxiosError } from "@/utils/extractError";
import { reportService } from "../services/reportService";
import type { CreateReportExportPayload, ReportsFilterParams } from "../types/report.types";
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

export const useExportJobs = (params?: { page?: number; page_size?: number }, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: reportKeys.exportJobs(params),
    queryFn: () => reportService.getExportJobs(params).then((res) => res.data),
    enabled: options?.enabled ?? true,
    refetchInterval: 8000,
  });

export const useCreateReportExport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateReportExportPayload) => reportService.createExport(payload).then((res) => res.data),
    onSuccess: () => {
      toast.success("Export queued successfully");
      queryClient.invalidateQueries({ queryKey: reportKeys.exportJobs() });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, "Failed to queue export"));
    },
  });
};

export const useDownloadReportExport = () => {
  return useMutation({
    mutationFn: async (input: { id: number; filename: string }) => {
      const response = await reportService.downloadExport(input.id);
      const blob = response.data;
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = input.filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
      return true;
    },
    onSuccess: () => {
      toast.success("Export download started");
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, "Failed to download export"));
    },
  });
};
