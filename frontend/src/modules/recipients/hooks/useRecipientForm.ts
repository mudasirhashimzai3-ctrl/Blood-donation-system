import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { recipientFormSchema, type RecipientFormValues } from "../schemas/recipientSchemas";
import type { Recipient, RecipientPayload } from "../types/recipient.types";

const defaultValues: RecipientFormValues = {
  full_name: "",
  email: "",
  phone: "",
  required_blood_group: "A+",
  age: 18,
  gender: "male",
  hospital: 0,
  emergency_level: "normal",
  status: "pending",
};

export const mapRecipientToFormValues = (recipient?: Partial<Recipient>): RecipientFormValues => {
  if (!recipient) return defaultValues;

  return {
    full_name: recipient.full_name ?? "",
    email: recipient.email ?? "",
    phone: recipient.phone ?? "",
    required_blood_group: recipient.required_blood_group ?? "A+",
    age: recipient.age ?? 18,
    gender: recipient.gender ?? "male",
    hospital: recipient.hospital ?? 0,
    emergency_level: recipient.emergency_level ?? "normal",
    status: recipient.status ?? "pending",
  };
};

const emptyToNull = (value?: string) => {
  if (!value || value.trim() === "") return null;
  return value.trim();
};

export const normalizeRecipientPayload = (values: RecipientFormValues): RecipientPayload => ({
  ...values,
  full_name: values.full_name.trim(),
  phone: values.phone.trim(),
  email: emptyToNull(values.email),
});

export const useRecipientForm = (recipient?: Partial<Recipient>) => {
  return useForm<RecipientFormValues>({
    resolver: zodResolver(recipientFormSchema),
    defaultValues: mapRecipientToFormValues(recipient),
  });
};

