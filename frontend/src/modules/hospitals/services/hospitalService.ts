import apiClient from "@/lib/api";
import type {
  Hospital,
  HospitalPayload,
  HospitalQueryParams,
  PaginatedHospitals,
} from "../types/hospital.types";

export const hospitalService = {
  getHospitals: (params?: HospitalQueryParams) =>
    apiClient.get<PaginatedHospitals>("/hospitals/", { params }),

  getHospital: (id: number) => apiClient.get<Hospital>(`/hospitals/${id}/`),

  createHospital: (payload: HospitalPayload) => apiClient.post<Hospital>("/hospitals/", payload),

  updateHospital: (id: number, payload: Partial<HospitalPayload>) =>
    apiClient.patch<Hospital>(`/hospitals/${id}/`, payload),

  deleteHospital: (id: number) => apiClient.delete(`/hospitals/${id}/`),

  activateHospital: (id: number) => apiClient.patch<Hospital>(`/hospitals/${id}/activate/`, {}),

  deactivateHospital: (id: number) => apiClient.patch<Hospital>(`/hospitals/${id}/deactivate/`, {}),
};

