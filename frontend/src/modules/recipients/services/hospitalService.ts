import apiClient from "@/lib/api";
import type {
  Hospital,
  HospitalPayload,
  HospitalQueryParams,
  PaginatedHospitals,
} from "../types/recipient.types";

export const hospitalService = {
  getHospitals: (params?: HospitalQueryParams) =>
    apiClient.get<PaginatedHospitals>("/recipients/hospitals/", { params }),

  getHospital: (id: number) => apiClient.get<Hospital>(`/recipients/hospitals/${id}/`),

  createHospital: (payload: HospitalPayload) =>
    apiClient.post<Hospital>("/recipients/hospitals/", payload),

  updateHospital: (id: number, payload: Partial<HospitalPayload>) =>
    apiClient.patch<Hospital>(`/recipients/hospitals/${id}/`, payload),

  deleteHospital: (id: number) => apiClient.delete(`/recipients/hospitals/${id}/`),
};

