import apiClient from "@/lib/api";
import type {
  Notification,
  NotificationQueryParams,
  PaginatedNotifications,
  UnreadCountResponse,
} from "../types/notification.types";

export const notificationService = {
  getNotifications: (params?: NotificationQueryParams) =>
    apiClient.get<PaginatedNotifications>("/notifications/", { params }),

  getNotification: (id: number) => apiClient.get<Notification>(`/notifications/${id}/`),

  getUnreadCount: () => apiClient.get<UnreadCountResponse>("/notifications/unread-count/"),

  setRead: (id: number, isRead: boolean) =>
    apiClient.patch<Notification>(`/notifications/${id}/read/`, { is_read: isRead }),

  markAllRead: () => apiClient.post<{ updated: number }>("/notifications/mark-all-read/", {}),

  deleteNotification: (id: number) => apiClient.delete(`/notifications/${id}/`),
};
