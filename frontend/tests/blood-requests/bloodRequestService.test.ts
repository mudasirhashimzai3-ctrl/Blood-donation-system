import { describe, expect, it } from "vitest";

import { buildBloodRequestFormData } from "@/modules/blood-requests/services/bloodRequestService";

describe("buildBloodRequestFormData", () => {
  it("serializes primitive payload fields", () => {
    const formData = buildBloodRequestFormData({
      recipient: 1,
      hospital: 2,
      blood_group: "O+",
      units_needed: 2,
      request_type: "urgent",
      priority: "high",
      auto_match_enabled: true,
      location_lat: "34.555300",
      location_lon: "69.207500",
      is_active: true,
      is_verified: false,
      is_emergency: true,
      response_deadline: null,
    });

    expect(formData.get("recipient")).toBe("1");
    expect(formData.get("hospital")).toBe("2");
    expect(formData.get("auto_match_enabled")).toBe("true");
    expect(formData.get("is_verified")).toBe("false");
    expect(formData.get("response_deadline")).toBe("");
  });
});
