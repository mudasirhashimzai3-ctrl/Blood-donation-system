import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { hospitalFormSchema, type HospitalFormValues } from "../schemas/hospitalSchemas";
import type { Hospital, HospitalPayload } from "../types/hospital.types";

const defaultValues: HospitalFormValues = {
  name: "",
  phone: "",
  email: "",
  address: "",
  city: "",
  latitude: "",
  longitude: "",
  is_active: true,
};

export const mapHospitalToFormValues = (hospital?: Partial<Hospital>): HospitalFormValues => {
  if (!hospital) return defaultValues;

  return {
    name: hospital.name ?? "",
    phone: hospital.phone ?? "",
    email: hospital.email ?? "",
    address: hospital.address ?? "",
    city: hospital.city ?? "",
    latitude: hospital.latitude ?? "",
    longitude: hospital.longitude ?? "",
    is_active: hospital.is_active ?? true,
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
  city: values.city.trim(),
  latitude: emptyToNull(values.latitude),
  longitude: emptyToNull(values.longitude),
  is_active: values.is_active,
});

export const useHospitalForm = (hospital?: Partial<Hospital>) =>
  useForm<HospitalFormValues>({
    resolver: zodResolver(hospitalFormSchema),
    defaultValues: mapHospitalToFormValues(hospital),
  });

