import apiClient from "@/lib/api";
import type { Donor, DonorPayload, DonorQueryParams, PaginatedDonors } from "../types/donor.types";

const appendField = (formData: FormData, key: string, value: unknown) => {
  if (value === undefined || value === null) return;
  if (typeof value === "boolean") {
    formData.append(key, value ? "true" : "false");
    return;
  }
  formData.append(key, String(value));
};

const buildDonorFormData = (payload: Partial<DonorPayload>) => {
  const formData = new FormData();

  appendField(formData, "first_name", payload.first_name);
  appendField(formData, "last_name", payload.last_name);
  appendField(formData, "phone", payload.phone);
  appendField(formData, "email", payload.email ?? "");
  appendField(formData, "blood_group", payload.blood_group);
  appendField(formData, "status", payload.status);
  appendField(formData, "date_of_birth", payload.date_of_birth ?? "");
  appendField(formData, "address", payload.address ?? "");
  appendField(formData, "emergency_contact_name", payload.emergency_contact_name ?? "");
  appendField(formData, "emergency_contact_phone", payload.emergency_contact_phone ?? "");
  appendField(formData, "last_donation_date", payload.last_donation_date ?? "");
  appendField(formData, "notes", payload.notes ?? "");
  appendField(formData, "remove_profile_picture", payload.remove_profile_picture);

  if (payload.profile_picture) {
    formData.append("profile_picture", payload.profile_picture);
  }

  return formData;
};

export const donorService = {
  getDonors: (params?: DonorQueryParams) =>
    apiClient.get<PaginatedDonors>("/donors/", { params }),

  getDonor: (id: number) => apiClient.get<Donor>(`/donors/${id}/`),

  createDonor: (payload: DonorPayload) =>
    apiClient.post<Donor>("/donors/", buildDonorFormData(payload), {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  updateDonor: (id: number, payload: Partial<DonorPayload>) =>
    apiClient.patch<Donor>(`/donors/${id}/`, buildDonorFormData(payload), {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  deleteDonor: (id: number) => apiClient.delete(`/donors/${id}/`),
};
