import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { NotificationChannel, NotificationPriority, NotificationStatus, NotificationType } from "../types/notification.types";

interface NotificationUiState {
  search: string;
  status: NotificationStatus | "";
  type: NotificationType | "";
  sentVia: NotificationChannel | "";
  priority: NotificationPriority | "";
  page: number;
  pageSize: number;
  ordering: string;
  setSearch: (value: string) => void;
  setStatus: (value: NotificationStatus | "") => void;
  setType: (value: NotificationType | "") => void;
  setSentVia: (value: NotificationChannel | "") => void;
  setPriority: (value: NotificationPriority | "") => void;
  setPage: (value: number) => void;
  setPageSize: (value: number) => void;
  setOrdering: (value: string) => void;
  resetFilters: () => void;
}

export const useNotificationUiStore = create<NotificationUiState>()(
  persist(
    (set) => ({
      search: "",
      status: "",
      type: "",
      sentVia: "",
      priority: "",
      page: 1,
      pageSize: 10,
      ordering: "-created_at",
      setSearch: (search) => set({ search, page: 1 }),
      setStatus: (status) => set({ status, page: 1 }),
      setType: (type) => set({ type, page: 1 }),
      setSentVia: (sentVia) => set({ sentVia, page: 1 }),
      setPriority: (priority) => set({ priority, page: 1 }),
      setPage: (page) => set({ page }),
      setPageSize: (pageSize) => set({ pageSize, page: 1 }),
      setOrdering: (ordering) => set({ ordering, page: 1 }),
      resetFilters: () =>
        set({
          search: "",
          status: "",
          type: "",
          sentVia: "",
          priority: "",
          page: 1,
          ordering: "-created_at",
        }),
    }),
    {
      name: "notification-ui-state",
      partialize: (state) => ({
        search: state.search,
        status: state.status,
        type: state.type,
        sentVia: state.sentVia,
        priority: state.priority,
        pageSize: state.pageSize,
        ordering: state.ordering,
      }),
    }
  )
);
