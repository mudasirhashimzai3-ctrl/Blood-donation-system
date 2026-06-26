import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Resolver } from "react-hook-form";

import {
  bloodRequestFormSchema,
  type BloodRequestFormValues,
} from "../schemas/bloodRequestSchemas";
import type { BloodRequest, BloodRequestPayload } from "../types/bloodRequest.types";

const defaultValues: BloodRequestFormValues = {
  recipient: undefined,
  hospital: 0,
  blood_group: "A+",
  units_needed: 1,
  request_type: "normal",
  auto_match_enabled: true,
  location_lat: "",
  location_lon: "",
  response_deadline: "",
  medical_report: null,
  prescription_image: null,
  emergency_proof: null,
};

export const mapBloodRequestToFormValues = (
  bloodRequest?: Partial<BloodRequest>
): BloodRequestFormValues => {
  if (!bloodRequest) return defaultValues;

  return {
    recipient: undefined,
    hospital: bloodRequest.hospital ?? 0,
    blood_group: bloodRequest.blood_group ?? "A+",
    units_needed: bloodRequest.units_needed ?? 1,
    request_type: bloodRequest.request_type ?? "normal",
    auto_match_enabled: bloodRequest.auto_match_enabled ?? true,
    location_lat: bloodRequest.location_lat ?? "",
    location_lon: bloodRequest.location_lon ?? "",
    response_deadline: bloodRequest.response_deadline ?? "",
    medical_report: null,
    prescription_image: null,
    emergency_proof: null,
  };
};

const emptyToNull = (value?: string) => {
  if (!value || value.trim() === "") return null;
  return value.trim();
};

const emptyToUndefined = (value?: string) => {
  if (!value || value.trim() === "") return undefined;
  return value.trim();
};

export const normalizeBloodRequestPayload = (
  values: BloodRequestFormValues
): BloodRequestPayload => ({
  recipient: values.recipient,
  hospital: values.hospital,
  blood_group: values.blood_group,
  units_needed: values.units_needed,
  request_type: values.request_type,
  auto_match_enabled: values.auto_match_enabled,
  location_lat: emptyToUndefined(values.location_lat),
  location_lon: emptyToUndefined(values.location_lon),
  response_deadline: emptyToNull(values.response_deadline),
  medical_report: values.medical_report ?? null,
  prescription_image: values.prescription_image ?? null,
  emergency_proof: values.emergency_proof ?? null,
});

export const useBloodRequestForm = (bloodRequest?: Partial<BloodRequest>) => {
  return useForm<BloodRequestFormValues>({
    resolver: zodResolver(bloodRequestFormSchema) as Resolver<BloodRequestFormValues>,
    defaultValues: mapBloodRequestToFormValues(bloodRequest),
  });
};
