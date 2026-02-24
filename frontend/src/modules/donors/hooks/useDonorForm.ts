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
  status: "pending",
  profile_picture: null,
  remove_profile_picture: false,
  date_of_birth: "",
  address: "",
  emergency_contact_name: "",
  emergency_contact_phone: "",
  last_donation_date: "",
  notes: "",
};

export const mapDonorToFormValues = (donor?: Partial<Donor>): DonorFormValues => {
  if (!donor) return defaultValues;

  return {
    first_name: donor.first_name ?? "",
    last_name: donor.last_name ?? "",
    phone: donor.phone ?? "",
    email: donor.email ?? "",
    blood_group: donor.blood_group ?? "A+",
    status: donor.status ?? "pending",
    profile_picture: null,
    remove_profile_picture: false,
    date_of_birth: donor.date_of_birth ?? "",
    address: donor.address ?? "",
    emergency_contact_name: donor.emergency_contact_name ?? "",
    emergency_contact_phone: donor.emergency_contact_phone ?? "",
    last_donation_date: donor.last_donation_date ?? "",
    notes: donor.notes ?? "",
  };
};

export const useDonorForm = (donor?: Partial<Donor>) => {
  return useForm<DonorFormValues>({
    resolver: zodResolver(donorFormSchema),
    defaultValues: mapDonorToFormValues(donor),
  });
};
