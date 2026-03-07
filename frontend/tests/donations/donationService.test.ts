import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockGet, mockPatch, mockPost } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPatch: vi.fn(),
  mockPost: vi.fn(),
}));

vi.mock("@/lib/api", () => ({
  default: {
    get: mockGet,
    patch: mockPatch,
    post: mockPost,
  },
}));

import { donationService } from "@/modules/donations/services/donationService";

describe("donationService", () => {
  beforeEach(() => {
    mockGet.mockReset();
    mockPatch.mockReset();
    mockPost.mockReset();
  });

  it("calls list endpoint with params", () => {
    donationService.getDonations({ page: 2, status: "pending" });
    expect(mockGet).toHaveBeenCalledWith("/donations/", {
      params: { page: 2, status: "pending" },
    });
  });

  it("calls status update endpoint", () => {
    donationService.updateStatus(10, { status: "accepted" });
    expect(mockPatch).toHaveBeenCalledWith("/donations/10/status/", { status: "accepted" });
  });

  it("calls send reminder endpoint", () => {
    donationService.sendReminder(10, { channels: ["in_app"] });
    expect(mockPost).toHaveBeenCalledWith("/donations/10/send-reminder/", { channels: ["in_app"] });
  });
});
