import { describe, expect, it } from "vitest";

import { bloodRequestFormSchema } from "@/modules/blood-requests/schemas/bloodRequestSchemas";

describe("bloodRequestFormSchema", () => {
  it("accepts a valid payload", () => {
    const result = bloodRequestFormSchema.safeParse({
      hospital: 1,
      blood_group: "O+",
      units_needed: 2,
      request_type: "urgent",
      auto_match_enabled: true,
      location_lat: "34.555300",
      location_lon: "69.207500",
      response_deadline: "",
      medical_report: null,
      prescription_image: null,
      emergency_proof: null,
    });
    expect(result.success).toBe(true);
  });

  it("accepts only configured unit options", () => {
    for (const units of [1, 1.5, 2]) {
      const result = bloodRequestFormSchema.safeParse({
        hospital: 1,
        blood_group: "O+",
        units_needed: units,
        request_type: "urgent",
        auto_match_enabled: true,
        location_lat: "34.555300",
        location_lon: "69.207500",
        response_deadline: "",
        medical_report: null,
        prescription_image: null,
        emergency_proof: null,
      });
      expect(result.success).toBe(true);
    }

    for (const units of [0, 1.2, 3]) {
      const result = bloodRequestFormSchema.safeParse({
        hospital: 1,
        blood_group: "O+",
        units_needed: units,
        request_type: "urgent",
        auto_match_enabled: true,
        location_lat: "34.555300",
        location_lon: "69.207500",
        response_deadline: "",
        medical_report: null,
        prescription_image: null,
        emergency_proof: null,
      });
      expect(result.success).toBe(false);
    }
  });

  it("rejects invalid coordinates", () => {
    const result = bloodRequestFormSchema.safeParse({
      hospital: 1,
      blood_group: "O+",
      units_needed: 2,
      request_type: "urgent",
      auto_match_enabled: true,
      location_lat: "120",
      location_lon: "190",
      response_deadline: "",
      medical_report: null,
      prescription_image: null,
      emergency_proof: null,
    });

    expect(result.success).toBe(false);
  });
});
