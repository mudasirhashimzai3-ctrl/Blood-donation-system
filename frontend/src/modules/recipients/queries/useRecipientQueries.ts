import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { extractAxiosError } from "@/utils/extractError";
import type { PaginatedRecipients, RecipientPayload, RecipientQueryParams } from "../types/recipient.types";
import { hospitalKeys } from "./hospitalKeys";
import { recipientKeys } from "./recipientKeys";
import { recipientService } from "../services/recipientService";

export const useRecipientsList = (params?: RecipientQueryParams) =>
  useQuery<PaginatedRecipients>({
    queryKey: recipientKeys.list(params),
    queryFn: () => recipientService.getRecipients(params).then((res) => res.data),
  });

export const useRecipient = (id: number, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: recipientKeys.detail(id),
    queryFn: () => recipientService.getRecipient(id).then((res) => res.data),
    enabled: options?.enabled ?? true,
  });

export const useCreateRecipient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RecipientPayload) =>
      recipientService.createRecipient(payload).then((res) => res.data),
    onSuccess: () => {
      toast.success("Recipient created successfully");
      queryClient.invalidateQueries({ queryKey: recipientKeys.lists() });
      queryClient.invalidateQueries({ queryKey: hospitalKeys.lists() });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, "Failed to create recipient"));
    },
  });
};

export const useUpdateRecipient = (id: number) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: Partial<RecipientPayload>) =>
      recipientService.updateRecipient(id, payload).then((res) => res.data),
    onSuccess: () => {
      toast.success("Recipient updated successfully");
      queryClient.invalidateQueries({ queryKey: recipientKeys.lists() });
      queryClient.invalidateQueries({ queryKey: recipientKeys.detail(id) });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, "Failed to update recipient"));
    },
  });
};

export const useDeleteRecipient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => recipientService.deleteRecipient(id),
    onSuccess: () => {
      toast.success("Recipient deleted successfully");
      queryClient.invalidateQueries({ queryKey: recipientKeys.lists() });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, "Failed to delete recipient"));
    },
  });
};

export const useBlockRecipient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => recipientService.blockRecipient(id).then((res) => res.data),
    onSuccess: (_data, id) => {
      toast.success("Recipient blocked successfully");
      queryClient.invalidateQueries({ queryKey: recipientKeys.lists() });
      queryClient.invalidateQueries({ queryKey: recipientKeys.detail(id) });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, "Failed to block recipient"));
    },
  });
};

export const useUnblockRecipient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => recipientService.unblockRecipient(id).then((res) => res.data),
    onSuccess: (_data, id) => {
      toast.success("Recipient unblocked successfully");
      queryClient.invalidateQueries({ queryKey: recipientKeys.lists() });
      queryClient.invalidateQueries({ queryKey: recipientKeys.detail(id) });
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, "Failed to unblock recipient"));
    },
  });
};

