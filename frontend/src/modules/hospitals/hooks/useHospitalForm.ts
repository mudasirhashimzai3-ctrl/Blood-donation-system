import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { hospitalFormSchema, type HospitalFormValues } from "../schemas/hospitalSchemas";
import { AFGHANISTAN_PROVINCES, type Hospital, type HospitalPayload, type Province } from "../types/hospital.types";

const normalizeProvince = (value?: string | null): Province => {
  const candidate = value?.trim();
  return (AFGHANISTAN_PROVINCES as readonly string[]).includes(candidate ?? "") ? (candidate as Province) : "Kabul";
};

const defaultValues: HospitalFormValues = {
  name: "",
  phone: "",
  email: "",
  address: "",
  province: "Kabul",
  latitude: "",
  longitude: "",
};

export const mapHospitalToFormValues = (hospital?: Partial<Hospital>): HospitalFormValues => {
  if (!hospital) return defaultValues;

  return {
    name: hospital.name ?? "",
    phone: hospital.phone ?? "",
    email: hospital.email ?? "",
    address: hospital.address ?? "",
    province: normalizeProvince(hospital.province ?? hospital.city),
    latitude: hospital.latitude ?? "",
    longitude: hospital.longitude ?? "",
  };
};

const emptyToNull = (value?: string) => {
  if (!value || value.trim() === "") return null;
  return value.trim();
};

export const normalizeHospitalPayload = (values: HospitalFormValues): HospitalPayload => ({
  name: values.name.trim(),
  phone: emptyToNull(values.phone),
  email: emptyToNull(values.email),
  address: emptyToNull(values.address),
  province: values.province,
  city: values.province,
  latitude: emptyToNull(values.latitude),
  longitude: emptyToNull(values.longitude),
});

export const useHospitalForm = (hospital?: Partial<Hospital>) =>
  useForm<HospitalFormValues>({
    resolver: zodResolver(hospitalFormSchema),
    defaultValues: mapHospitalToFormValues(hospital),
  });
