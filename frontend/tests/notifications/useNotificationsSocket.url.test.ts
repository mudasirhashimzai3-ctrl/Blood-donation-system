import { describe, expect, it } from "vitest";

import {
  buildNotificationsSocketUrl,
  deriveWebSocketBaseFromApiBase,
} from "@/modules/notifications/hooks/useNotificationsSocket";

describe("notifications socket url resolution", () => {
  it("derives websocket origin from API base URL", () => {
    const base = deriveWebSocketBaseFromApiBase("https://api.example.com/api");
    expect(base).toBe("wss://api.example.com");
  });

  it("builds notifications websocket URL from API base when WS env is unset", () => {
    const url = buildNotificationsSocketUrl({
      apiBaseUrl: "http://localhost:8000/api",
      wsBaseUrl: "",
      token: "abc123",
      fallbackOrigin: "http://localhost:5173",
    });
    expect(url).toBe("ws://localhost:8000/ws/notifications/?token=abc123");
  });

  it("prefers explicit websocket base URL when provided", () => {
    const url = buildNotificationsSocketUrl({
      apiBaseUrl: "http://localhost:8000/api",
      wsBaseUrl: "wss://socket.example.com",
      token: "abc123",
      fallbackOrigin: "http://localhost:5173",
    });
    expect(url).toBe("wss://socket.example.com/ws/notifications/?token=abc123");
  });
});
