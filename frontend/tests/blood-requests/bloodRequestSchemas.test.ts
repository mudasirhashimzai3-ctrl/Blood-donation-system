import { describe, expect, it } from "vitest";

import { bloodRequestFormSchema } from "@/modules/blood-requests/schemas/bloodRequestSchemas";

describe("bloodRequestFormSchema", () => {
  it("accepts a valid payload", () => {
    const result = bloodRequestFormSchema.safeParse({
      recipient: 1,
      hospital: 1,
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
      response_deadline: "",
      medical_report: null,
      prescription_image: null,
      emergency_proof: null,
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid coordinates", () => {
    const result = bloodRequestFormSchema.safeParse({
      recipient: 1,
      hospital: 1,
      blood_group: "O+",
      units_needed: 2,
      request_type: "urgent",
      priority: "high",
      auto_match_enabled: true,
      location_lat: "120",
      location_lon: "190",
      is_active: true,
      is_verified: false,
      is_emergency: true,
      response_deadline: "",
      medical_report: null,
      prescription_image: null,
      emergency_proof: null,
    });

    expect(result.success).toBe(false);
  });
});
