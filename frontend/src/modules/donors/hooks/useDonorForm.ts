import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { donorFormSchema, type DonorFormValues } from "../schemas/donorSchemas";
import type { Donor } from "../types/donor.types";

const defaultValues: DonorFormValues = {
  first_name: "",
  last_name: "",
  phone: "",
  email: "",
  blood_group: "A+",
  profile_picture: null,
  remove_profile_picture: false,
  age: "",
  permanent_address: "",
  local_address: "",
  last_donation_date: "",
  latitude: "",
  longitude: "",
};

export const mapDonorToFormValues = (donor?: Partial<Donor>): DonorFormValues => {
  if (!donor) return defaultValues;

  return {
    first_name: donor.first_name ?? "",
    last_name: donor.last_name ?? "",
    phone: donor.phone ?? "",
    email: donor.email ?? "",
    blood_group: donor.blood_group ?? "A+",
    profile_picture: null,
    remove_profile_picture: false,
    age: donor.age?.toString() ?? "",
    permanent_address: donor.permanent_address ?? "",
    local_address: donor.local_address ?? "",
    last_donation_date: donor.last_donation_date ?? "",
    latitude: donor.latitude ?? "",
    longitude: donor.longitude ?? "",
  };
};

export const useDonorForm = (donor?: Partial<Donor>) => {
  return useForm<DonorFormValues>({
    resolver: zodResolver(donorFormSchema),
    defaultValues: mapDonorToFormValues(donor),
  });
};
