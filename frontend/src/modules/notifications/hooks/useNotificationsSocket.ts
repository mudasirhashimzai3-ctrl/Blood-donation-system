import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { getAccessToken } from "@/lib/api";
import { useUserStore } from "@/modules/auth/stores/useUserStore";
import { notificationKeys } from "../queries/notificationKeys";

const DEFAULT_API_BASE_URL = "http://localhost:8000/api";

export const deriveWebSocketBaseFromApiBase = (
  apiBaseUrl: string,
  fallbackOrigin?: string
) => {
  try {
    const parsed = new URL(apiBaseUrl, fallbackOrigin);
    const protocol = parsed.protocol === "https:" ? "wss" : "ws";
    return `${protocol}://${parsed.host}`;
  } catch {
    const fallback = new URL(fallbackOrigin || "http://localhost:8000");
    const protocol = fallback.protocol === "https:" ? "wss" : "ws";
    return `${protocol}://${fallback.host}`;
  }
};

export const buildNotificationsSocketUrl = (params?: {
  apiBaseUrl?: string;
  wsBaseUrl?: string;
  token?: string | null;
  fallbackOrigin?: string;
}) => {
  const fromEnv = params?.wsBaseUrl ?? (import.meta.env.VITE_WS_BASE_URL as string | undefined);
  const apiBaseUrl =
    params?.apiBaseUrl ??
    ((import.meta.env.VITE_API_BASE_URL as string | undefined) || DEFAULT_API_BASE_URL);
  const token = params?.token ?? getAccessToken();

  const base =
    fromEnv && fromEnv.trim().length > 0
      ? fromEnv
      : deriveWebSocketBaseFromApiBase(apiBaseUrl, params?.fallbackOrigin ?? window.location.origin);

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

    const socketUrl = buildNotificationsSocketUrl();
    const ws = new WebSocket(socketUrl);
    let didUnmount = false;

    ws.onopen = () => {
      if (didUnmount) {
        ws.close();
      }
    };

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
      didUnmount = true;
      if (ws.readyState === WebSocket.OPEN) {
        ws.close();
      }
    };
  }, [enabled, queryClient, user]);
};
