import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGet, mockPatch, mockPost, mockDelete } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPatch: vi.fn(),
  mockPost: vi.fn(),
  mockDelete: vi.fn(),
}));

vi.mock("@/lib/api", () => ({
  default: {
    get: mockGet,
    patch: mockPatch,
    post: mockPost,
    delete: mockDelete,
  },
}));

import { notificationService } from "@/modules/notifications/services/notificationService";

describe("notificationService", () => {
  beforeEach(() => {
    mockGet.mockReset();
    mockPatch.mockReset();
    mockPost.mockReset();
    mockDelete.mockReset();
  });

  it("calls list endpoint with params", () => {
    notificationService.getNotifications({ page: 2, status: "queued" });
    expect(mockGet).toHaveBeenCalledWith("/notifications/", {
      params: { page: 2, status: "queued" },
    });
  });

  it("calls mark read endpoint", () => {
    notificationService.setRead(7, true);
    expect(mockPatch).toHaveBeenCalledWith("/notifications/7/read/", { is_read: true });
  });

  it("calls mark all read endpoint", () => {
    notificationService.markAllRead();
    expect(mockPost).toHaveBeenCalledWith("/notifications/mark-all-read/", {});
  });

  it("calls delete endpoint", () => {
    notificationService.deleteNotification(4);
    expect(mockDelete).toHaveBeenCalledWith("/notifications/4/");
  });
});
