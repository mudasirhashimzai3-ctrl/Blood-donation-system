import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { extractAxiosError } from "@/utils/extractError";
import { notificationService } from "../services/notificationService";
import type { NotificationQueryParams, PaginatedNotifications, UnreadCountResponse } from "../types/notification.types";
import { notificationKeys } from "./notificationKeys";

const invalidateNotifications = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
  queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
  queryClient.invalidateQueries({ queryKey: notificationKeys.recent() });
};

export const useNotificationsList = (params?: NotificationQueryParams) =>
  useQuery<PaginatedNotifications>({
    queryKey: notificationKeys.list(params),
    queryFn: () => notificationService.getNotifications(params).then((res) => res.data),
  });

export const useNotification = (id: number, options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: notificationKeys.detail(id),
    queryFn: () => notificationService.getNotification(id).then((res) => res.data),
    enabled: options?.enabled ?? true,
  });

export const useUnreadCount = (options?: { enabled?: boolean }) =>
  useQuery<UnreadCountResponse>({
    queryKey: notificationKeys.unreadCount(),
    queryFn: () => notificationService.getUnreadCount().then((res) => res.data),
    enabled: options?.enabled ?? true,
    refetchInterval: 30000,
  });

export const useRecentNotifications = () =>
  useQuery<PaginatedNotifications>({
    queryKey: notificationKeys.recent(),
    queryFn: () =>
      notificationService
        .getNotifications({ page: 1, page_size: 6, ordering: "-created_at" })
        .then((res) => res.data),
    refetchInterval: 30000,
  });

export const useSetNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { id: number; isRead: boolean }) =>
      notificationService.setRead(payload.id, payload.isRead).then((res) => res.data),
    onSuccess: (data) => {
      queryClient.setQueryData(notificationKeys.detail(data.id), data);
      invalidateNotifications(queryClient);
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, "Failed to update notification status"));
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => notificationService.markAllRead().then((res) => res.data),
    onSuccess: () => {
      invalidateNotifications(queryClient);
      toast.success("All notifications marked as read");
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, "Failed to mark all notifications as read"));
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => notificationService.deleteNotification(id),
    onSuccess: () => {
      invalidateNotifications(queryClient);
      toast.success("Notification removed");
    },
    onError: (error) => {
      toast.error(extractAxiosError(error, "Failed to remove notification"));
    },
  });
};
