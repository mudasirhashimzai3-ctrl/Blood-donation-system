import { useMarkAllNotificationsRead, useRecentNotifications, useSetNotificationRead, useUnreadCount } from "../queries/useNotificationQueries";

export const useNotificationBell = () => {
  const recentQuery = useRecentNotifications();
  const unreadQuery = useUnreadCount();
  const setReadMutation = useSetNotificationRead();
  const markAllReadMutation = useMarkAllNotificationsRead();

  return {
    notifications: recentQuery.data?.results ?? [],
    unreadCount: unreadQuery.data?.count ?? 0,
    isLoading: recentQuery.isLoading || unreadQuery.isLoading,
    markAsRead: async (id: number, isRead: boolean) => {
      await setReadMutation.mutateAsync({ id, isRead });
    },
    markAllRead: async () => {
      await markAllReadMutation.mutateAsync();
    },
    isMutating: setReadMutation.isPending || markAllReadMutation.isPending,
  };
};
