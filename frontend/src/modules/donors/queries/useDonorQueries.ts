import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { extractAxiosError } from "@/utils/extractError";
import { donorService } from "../services/donorService";
import { donorKeys } from "./donorKeys";
import type { DonorPayload, DonorQueryParams, PaginatedDonors } from "../types/donor.types";

export const useDonorsList = (params?: DonorQueryParams) =>
  useQuery<PaginatedDonors>({
    queryKey: donorKeys.list(params),
    queryFn: () => donorService.getDonors(params).then((res) => res.data),
  });

export const useDonor = (id: number, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: donorKeys.detail(id),
    queryFn: () => donorService.getDonor(id).then((res) => res.data),
    enabled: options?.enabled ?? true,
  });

export const useCreateDonor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: DonorPayload) =>
      donorService.createDonor(payload).then((res) => res.data),
    onSuccess: () => {
      toast.success("Donor created successfully");
      queryClient.invalidateQueries({ queryKey: donorKeys.lists() });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, "Failed to create donor"));
    },
  });
};

export const useUpdateDonor = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<DonorPayload>) =>
      donorService.updateDonor(id, payload).then((res) => res.data),
    onSuccess: () => {
      toast.success("Donor updated successfully");
      queryClient.invalidateQueries({ queryKey: donorKeys.lists() });
      queryClient.invalidateQueries({ queryKey: donorKeys.detail(id) });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, "Failed to update donor"));
    },
  });
};

export const useDeleteDonor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => donorService.deleteDonor(id),
    onSuccess: () => {
      toast.success("Donor deleted successfully");
      queryClient.invalidateQueries({ queryKey: donorKeys.lists() });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, "Failed to delete donor"));
    },
  });
};

