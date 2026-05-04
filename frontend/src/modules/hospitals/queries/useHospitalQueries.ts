import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { extractAxiosError } from "@/utils/extractError";
import type {
  HospitalListItem,
  HospitalPayload,
  HospitalQueryParams,
  PaginatedHospitals,
} from "../types/hospital.types";
import { hospitalService } from "../services/hospitalService";
import { hospitalKeys } from "./hospitalKeys";

export const useHospitalsList = (params?: HospitalQueryParams, options?: { enabled?: boolean }) =>
  useQuery<PaginatedHospitals>({
    queryKey: hospitalKeys.list(params),
    queryFn: () => hospitalService.getHospitals(params).then((res) => res.data),
    enabled: options?.enabled ?? true,
  });

export const useAllHospitalsList = (
  params?: Omit<HospitalQueryParams, "page">,
  options?: { enabled?: boolean }
) =>
  useQuery<HospitalListItem[]>({
    queryKey: hospitalKeys.allList(params),
    queryFn: async () => {
      const pageSize = params?.page_size ?? 200;
      const aggregated: HospitalListItem[] = [];
      let page = 1;
      let hasNext = true;

      while (hasNext) {
        const response = await hospitalService.getHospitals({
          ...params,
          page,
          page_size: pageSize,
        });
        aggregated.push(...response.data.results);
        hasNext = Boolean(response.data.next);
        page += 1;
      }

      return aggregated;
    },
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
