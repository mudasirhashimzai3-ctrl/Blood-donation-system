import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { extractAxiosError } from "@/utils/extractError";
import type { HospitalPayload, HospitalQueryParams, PaginatedHospitals } from "../types/hospital.types";
import { hospitalService } from "../services/hospitalService";
import { hospitalKeys } from "./hospitalKeys";

export const useHospitalsList = (params?: HospitalQueryParams, options?: { enabled?: boolean }) =>
  useQuery<PaginatedHospitals>({
    queryKey: hospitalKeys.list(params),
    queryFn: () => hospitalService.getHospitals(params).then((res) => res.data),
    enabled: options?.enabled ?? true,
  });

export const useHospital = (id: number, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: hospitalKeys.detail(id),
    queryFn: () => hospitalService.getHospital(id).then((res) => res.data),
    enabled: options?.enabled ?? true,
  });

export const useCreateHospital = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: HospitalPayload) => hospitalService.createHospital(payload).then((res) => res.data),
    onSuccess: () => {
      toast.success("Hospital created successfully");
      queryClient.invalidateQueries({ queryKey: hospitalKeys.lists() });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, "Failed to create hospital"));
    },
  });
};

export const useUpdateHospital = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<HospitalPayload>) =>
      hospitalService.updateHospital(id, payload).then((res) => res.data),
    onSuccess: () => {
      toast.success("Hospital updated successfully");
      queryClient.invalidateQueries({ queryKey: hospitalKeys.lists() });
      queryClient.invalidateQueries({ queryKey: hospitalKeys.detail(id) });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, "Failed to update hospital"));
    },
  });
};

export const useDeleteHospital = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => hospitalService.deleteHospital(id),
    onSuccess: () => {
      toast.success("Hospital deleted successfully");
      queryClient.invalidateQueries({ queryKey: hospitalKeys.lists() });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, "Failed to delete hospital"));
    },
  });
};

export const useActivateHospital = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => hospitalService.activateHospital(id).then((res) => res.data),
    onSuccess: (_data, id) => {
      toast.success("Hospital activated successfully");
      queryClient.invalidateQueries({ queryKey: hospitalKeys.lists() });
      queryClient.invalidateQueries({ queryKey: hospitalKeys.detail(id) });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, "Failed to activate hospital"));
    },
  });
};

export const useDeactivateHospital = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => hospitalService.deactivateHospital(id).then((res) => res.data),
    onSuccess: (_data, id) => {
      toast.success("Hospital deactivated successfully");
      queryClient.invalidateQueries({ queryKey: hospitalKeys.lists() });
      queryClient.invalidateQueries({ queryKey: hospitalKeys.detail(id) });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, "Failed to deactivate hospital"));
    },
  });
};

