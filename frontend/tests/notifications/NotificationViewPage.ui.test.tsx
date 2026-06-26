import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import NotificationViewPage from "@/modules/notifications/pages/NotificationViewPage";

const navigateMock = vi.hoisted(() => vi.fn());
const notificationMock = vi.hoisted(() => ({
  current: {
    id: 7,
    user_id: 1,
    user_type: "admin",
    request_id: null,
    donation_id: null,
    event_key: "blood_request_created",
    type: "request_update",
    title: "Blood request created",
    message: "A new blood request is waiting for review.",
    sent_via: "in_app",
    status: "queued",
    is_read: false,
    read_at: null,
    sent_at: null,
    metadata: {
      status: "pending",
      language: "en",
      request_type: "normal",
    },
    dedupe_key: null,
    error_message: null,
    provider_message_id: null,
    provider_status: null,
    provider_response: null,
    delivery_attempts: 0,
    expires_at: null,
    created_at: "2026-06-26T12:00:00Z",
    updated_at: "2026-06-26T12:00:00Z",
  },
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useParams: () => ({ id: "7" }),
  };
});

vi.mock("react-i18next", () => ({
  initReactI18next: {
    type: "3rdParty",
    init: () => {},
  },
  useTranslation: () => ({
    t: (_key: string, defaultValue?: string) => defaultValue ?? _key,
  }),
}));

vi.mock("@/hooks/useCan", () => ({
  default: () => ({ can: () => true }),
}));

vi.mock("@/modules/auth/stores/useUserStore", () => ({
  useUserStore: (selector: (state: { userProfile: { role: "admin" } }) => unknown) =>
    selector({ userProfile: { role: "admin" } }),
}));

vi.mock("@/modules/notifications/queries/useNotificationQueries", () => ({
  useNotification: () => ({
    data: notificationMock.current,
    isLoading: false,
    error: null,
  }),
  useSetNotificationRead: () => ({
    isPending: false,
    mutateAsync: vi.fn(),
  }),
  useDeleteNotification: () => ({
    isPending: false,
    mutateAsync: vi.fn(),
  }),
}));

describe("NotificationViewPage", () => {
  it("does not show noisy metadata as raw JSON", () => {
    render(<NotificationViewPage />);

    expect(screen.getByText("Blood request created")).toBeInTheDocument();
    expect(screen.getByText("A new blood request is waiting for review.")).toBeInTheDocument();
    expect(screen.queryByText("Metadata")).not.toBeInTheDocument();
    expect(screen.queryByText(/"request_type": "normal"/)).not.toBeInTheDocument();
  });
});
