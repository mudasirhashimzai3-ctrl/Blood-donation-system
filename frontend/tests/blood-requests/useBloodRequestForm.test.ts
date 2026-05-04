import { describe, expect, it } from "vitest";

import {
  mapBloodRequestToFormValues,
  normalizeBloodRequestPayload,
} from "@/modules/blood-requests/hooks/useBloodRequestForm";

describe("useBloodRequestForm helpers", () => {
  it("maps model data to form values", () => {
    const values = mapBloodRequestToFormValues({
      hospital: 11,
      blood_group: "A+",
      units_needed: 3,
      request_type: "critical",
      auto_match_enabled: true,
      location_lat: "34.555300",
      location_lon: "69.207500",
      response_deadline: "2026-02-28T10:00:00Z",
    });

    expect(values.hospital).toBe(11);
    expect(values.request_type).toBe("critical");
  });

  it("normalizes payload and converts empty deadline to null", () => {
    const payload = normalizeBloodRequestPayload({
      hospital: 1,
      blood_group: "O+",
      units_needed: 2,
      request_type: "normal",
      auto_match_enabled: true,
      location_lat: " 34.555300 ",
      location_lon: " 69.207500 ",
      response_deadline: "",
      medical_report: null,
      prescription_image: null,
      emergency_proof: null,
    });

    expect(payload.location_lat).toBe("34.555300");
    expect(payload.location_lon).toBe("69.207500");
    expect(payload.response_deadline).toBeNull();
  });
});
