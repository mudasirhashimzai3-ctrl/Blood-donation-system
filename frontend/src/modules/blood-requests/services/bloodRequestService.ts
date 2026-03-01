import apiClient from "@/lib/api";
import type {
  BloodRequest,
  BloodRequestNotification,
  BloodRequestPayload,
  BloodRequestQueryParams,
  PaginatedBloodRequests,
} from "../types/bloodRequest.types";

const appendField = (formData: FormData, key: string, value: unknown) => {
  if (value === undefined || value === null) return;
  if (typeof value === "boolean") {
    formData.append(key, value ? "true" : "false");
    return;
  }
  formData.append(key, String(value));
};

export const buildBloodRequestFormData = (payload: Partial<BloodRequestPayload>) => {
  const formData = new FormData();

  appendField(formData, "recipient", payload.recipient);
  appendField(formData, "hospital", payload.hospital);
  appendField(formData, "blood_group", payload.blood_group);
  appendField(formData, "units_needed", payload.units_needed);
  appendField(formData, "request_type", payload.request_type);
  appendField(formData, "priority", payload.priority);
  appendField(formData, "auto_match_enabled", payload.auto_match_enabled);
  appendField(formData, "location_lat", payload.location_lat);
  appendField(formData, "location_lon", payload.location_lon);
  appendField(formData, "is_active", payload.is_active);
  appendField(formData, "is_verified", payload.is_verified);
  appendField(formData, "is_emergency", payload.is_emergency);
  appendField(formData, "response_deadline", payload.response_deadline ?? "");

  if (payload.medical_report) formData.append("medical_report", payload.medical_report);
  if (payload.prescription_image) formData.append("prescription_image", payload.prescription_image);
  if (payload.emergency_proof) formData.append("emergency_proof", payload.emergency_proof);

  return formData;
};

export const bloodRequestService = {
  getBloodRequests: (params?: BloodRequestQueryParams) =>
    apiClient.get<PaginatedBloodRequests>("/blood-requests/", { params }),

  getBloodRequest: (id: number) => apiClient.get<BloodRequest>(`/blood-requests/${id}/`),

  createBloodRequest: (payload: BloodRequestPayload) =>
    apiClient.post<BloodRequest>("/blood-requests/", buildBloodRequestFormData(payload), {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  updateBloodRequest: (id: number, payload: Partial<BloodRequestPayload>) =>
    apiClient.patch<BloodRequest>(`/blood-requests/${id}/`, buildBloodRequestFormData(payload), {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  deleteBloodRequest: (id: number) => apiClient.delete(`/blood-requests/${id}/`),

  runAutoMatch: (id: number) =>
    apiClient.post<{ request: BloodRequest; matched_candidates: number }>(`/blood-requests/${id}/run-auto-match/`, {}),

  assignDonor: (id: number, donorId: number) =>
    apiClient.patch<BloodRequest>(`/blood-requests/${id}/assign-donor/`, { donor_id: donorId }),

  completeBloodRequest: (id: number) =>
    apiClient.patch<BloodRequest>(`/blood-requests/${id}/complete/`, {}),

  cancelBloodRequest: (
    id: number,
    payload: { cancelled_by: "admin" | "recipient"; rejection_reason?: string | null }
  ) => apiClient.patch<BloodRequest>(`/blood-requests/${id}/cancel/`, payload),

  verifyBloodRequest: (id: number, isVerified: boolean) =>
    apiClient.patch<BloodRequest>(`/blood-requests/${id}/verify/`, { is_verified: isVerified }),

  getNotifications: (id: number) =>
    apiClient.get<BloodRequestNotification[]>(`/blood-requests/${id}/notifications/`),
};
