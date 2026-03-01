import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { extractAxiosError } from "@/utils/extractError";
import type {
  BloodRequestPayload,
  BloodRequestQueryParams,
  PaginatedBloodRequests,
} from "../types/bloodRequest.types";
import { bloodRequestService } from "../services/bloodRequestService";
import { bloodRequestKeys } from "./bloodRequestKeys";

export const useBloodRequestsList = (params?: BloodRequestQueryParams) =>
  useQuery<PaginatedBloodRequests>({
    queryKey: bloodRequestKeys.list(params),
    queryFn: () => bloodRequestService.getBloodRequests(params).then((res) => res.data),
  });

export const useBloodRequest = (id: number, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: bloodRequestKeys.detail(id),
    queryFn: () => bloodRequestService.getBloodRequest(id).then((res) => res.data),
    enabled: options?.enabled ?? true,
  });

export const useBloodRequestNotifications = (id: number, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: bloodRequestKeys.notifications(id),
    queryFn: () => bloodRequestService.getNotifications(id).then((res) => res.data),
    enabled: options?.enabled ?? true,
  });

export const useCreateBloodRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: BloodRequestPayload) =>
      bloodRequestService.createBloodRequest(payload).then((res) => res.data),
    onSuccess: () => {
      toast.success("Blood request created successfully");
      queryClient.invalidateQueries({ queryKey: bloodRequestKeys.lists() });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, "Failed to create blood request"));
    },
  });
};

export const useUpdateBloodRequest = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<BloodRequestPayload>) =>
      bloodRequestService.updateBloodRequest(id, payload).then((res) => res.data),
    onSuccess: () => {
      toast.success("Blood request updated successfully");
      queryClient.invalidateQueries({ queryKey: bloodRequestKeys.lists() });
      queryClient.invalidateQueries({ queryKey: bloodRequestKeys.detail(id) });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, "Failed to update blood request"));
    },
  });
};

export const useDeleteBloodRequest = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => bloodRequestService.deleteBloodRequest(id),
    onSuccess: () => {
      toast.success("Blood request deleted successfully");
      queryClient.invalidateQueries({ queryKey: bloodRequestKeys.lists() });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, "Failed to delete blood request"));
    },
  });
};

export const useRunAutoMatch = (id?: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (requestId?: number) => {
      const targetId = id ?? requestId;
      if (!targetId) {
        throw new Error("Missing blood request id");
      }
      return bloodRequestService.runAutoMatch(targetId).then((res) => res.data);
    },
    onSuccess: (data, requestId) => {
      const targetId = id ?? requestId;
      if (!targetId) return;
      toast.success(`Auto-match completed (${data.matched_candidates} candidates)`);
      queryClient.invalidateQueries({ queryKey: bloodRequestKeys.detail(targetId) });
      queryClient.invalidateQueries({ queryKey: bloodRequestKeys.notifications(targetId) });
      queryClient.invalidateQueries({ queryKey: bloodRequestKeys.lists() });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, "Failed to run auto-match"));
    },
  });
};

export const useAssignDonor = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (donorId: number) => bloodRequestService.assignDonor(id, donorId).then((res) => res.data),
    onSuccess: () => {
      toast.success("Donor assigned successfully");
      queryClient.invalidateQueries({ queryKey: bloodRequestKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: bloodRequestKeys.notifications(id) });
      queryClient.invalidateQueries({ queryKey: bloodRequestKeys.lists() });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, "Failed to assign donor"));
    },
  });
};

export const useCompleteBloodRequest = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => bloodRequestService.completeBloodRequest(id).then((res) => res.data),
    onSuccess: () => {
      toast.success("Blood request completed");
      queryClient.invalidateQueries({ queryKey: bloodRequestKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: bloodRequestKeys.lists() });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, "Failed to complete blood request"));
    },
  });
};

export const useCancelBloodRequest = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: { cancelled_by: "admin" | "recipient"; rejection_reason?: string | null }) =>
      bloodRequestService.cancelBloodRequest(id, payload).then((res) => res.data),
    onSuccess: () => {
      toast.success("Blood request cancelled");
      queryClient.invalidateQueries({ queryKey: bloodRequestKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: bloodRequestKeys.lists() });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, "Failed to cancel blood request"));
    },
  });
};

export const useVerifyBloodRequest = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (isVerified: boolean) =>
      bloodRequestService.verifyBloodRequest(id, isVerified).then((res) => res.data),
    onSuccess: () => {
      toast.success("Verification status updated");
      queryClient.invalidateQueries({ queryKey: bloodRequestKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: bloodRequestKeys.lists() });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, "Failed to update verification"));
    },
  });
};
