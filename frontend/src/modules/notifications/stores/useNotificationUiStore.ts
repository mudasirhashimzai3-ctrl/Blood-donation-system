import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { NotificationChannel, NotificationStatus, NotificationType } from "../types/notification.types";

interface NotificationUiState {
  status: NotificationStatus | "";
  type: NotificationType | "";
  sentVia: NotificationChannel | "";
  page: number;
  pageSize: number;
  ordering: string;
  setStatus: (value: NotificationStatus | "") => void;
  setType: (value: NotificationType | "") => void;
  setSentVia: (value: NotificationChannel | "") => void;
  setPage: (value: number) => void;
  setPageSize: (value: number) => void;
  setOrdering: (value: string) => void;
  resetFilters: () => void;
}

export const useNotificationUiStore = create<NotificationUiState>()(
  persist(
    (set) => ({
      status: "",
      type: "",
      sentVia: "",
      page: 1,
      pageSize: 10,
      ordering: "-created_at",
      setStatus: (status) => set({ status, page: 1 }),
      setType: (type) => set({ type, page: 1 }),
      setSentVia: (sentVia) => set({ sentVia, page: 1 }),
      setPage: (page) => set({ page }),
      setPageSize: (pageSize) => set({ pageSize, page: 1 }),
      setOrdering: (ordering) => set({ ordering, page: 1 }),
      resetFilters: () =>
        set({
          status: "",
          type: "",
          sentVia: "",
          page: 1,
          ordering: "-created_at",
        }),
    }),
    {
      name: "notification-ui-state",
      partialize: (state) => ({
        status: state.status,
        type: state.type,
        sentVia: state.sentVia,
        pageSize: state.pageSize,
        ordering: state.ordering,
      }),
    }
  )
);
