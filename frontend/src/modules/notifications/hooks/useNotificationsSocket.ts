import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { getAccessToken } from "@/lib/api";
import { useUserStore } from "@/modules/auth/stores/useUserStore";
import { notificationKeys } from "../queries/notificationKeys";

const buildSocketUrl = () => {
  const fromEnv = import.meta.env.VITE_WS_BASE_URL as string | undefined;
  const token = getAccessToken();

  let base = fromEnv;
  if (!base) {
    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    base = `${protocol}://${window.location.host}`;
  }

  const url = new URL("/ws/notifications/", base);
  if (token) {
    url.searchParams.set("token", token);
  }
  return url.toString();
};

export const useNotificationsSocket = (enabled = true) => {
  const queryClient = useQueryClient();
  const user = useUserStore((state) => state.userProfile);

  useEffect(() => {
    if (!enabled || !user) return;

    const socketUrl = buildSocketUrl();
    const ws = new WebSocket(socketUrl);

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as {
          event?: string;
          data?: Record<string, unknown>;
        };
        const eventType = payload.event;
        if (!eventType) return;

        if (
          eventType === "notification.created" ||
          eventType === "notification.updated" ||
          eventType === "notification.deleted"
        ) {
          queryClient.invalidateQueries({ queryKey: notificationKeys.lists() });
          queryClient.invalidateQueries({ queryKey: notificationKeys.recent() });
        }

        if (eventType === "notification.unread_count") {
          queryClient.invalidateQueries({ queryKey: notificationKeys.unreadCount() });
        }
      } catch {
        // Ignore malformed socket payloads.
      }
    };

    return () => {
      ws.close();
    };
  }, [enabled, queryClient, user]);
};
