import { Controller, type UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Button, Input, Select } from "@components/ui";
import { formatLocalDateTime } from "@/utils/formatLocalDateTime";
import { HospitalSearchSelect } from "@/modules/hospitals";
import { type RecipientFormValues } from "../schemas/recipientSchemas";
import {
  BLOOD_GROUP_OPTIONS,
  EMERGENCY_LEVEL_OPTIONS,
  GENDER_OPTIONS,
  RECIPIENT_STATUS_OPTIONS,
} from "../types/recipient.types";

interface RecipientFormProps {
  form: UseFormReturn<RecipientFormValues>;
  onSubmit: (values: RecipientFormValues) => Promise<void> | void;
  onCancel: () => void;
  submitLabel: string;
  loading?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export default function RecipientForm({
  form,
  onSubmit,
  onCancel,
  submitLabel,
  loading = false,
  createdAt,
  updatedAt,
}: RecipientFormProps) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label={t("recipients.form.fullName", "Full Name")}
          placeholder={t("recipients.form.fullNamePlaceholder", "Enter full name")}
          error={errors.full_name?.message}
          {...register("full_name")}
        />
        <Input
          type="email"
          label={t("recipients.form.email", "Email")}
          placeholder={t("recipients.form.emailPlaceholder", "Enter email")}
          error={errors.email?.message}
          {...register("email")}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label={t("recipients.form.phone", "Phone Number")}
          placeholder={t("recipients.form.phonePlaceholder", "Enter phone number")}
          error={errors.phone?.message}
          {...register("phone")}
        />
        <Input
          type="number"
          label={t("recipients.form.age", "Age")}
          error={errors.age?.message}
          {...register("age", { valueAsNumber: true })}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Select
          label={t("recipients.form.requiredBloodGroup", "Required Blood Group")}
          error={errors.required_blood_group?.message}
          options={BLOOD_GROUP_OPTIONS.map((group) => ({ value: group, label: group }))}
          {...register("required_blood_group")}
        />
        <Select
          label={t("recipients.form.gender", "Gender")}
          error={errors.gender?.message}
          options={GENDER_OPTIONS.map((gender) => ({
            value: gender,
            label: t(`recipients.gender.${gender}`, gender),
          }))}
          {...register("gender")}
        />
      </div>

      <Controller
        control={control}
        name="hospital"
        render={({ field }) => (
          <HospitalSearchSelect
            value={field.value}
            onChange={(hospitalId) => field.onChange(hospitalId)}
            error={errors.hospital?.message}
          />
        )}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Select
          label={t("recipients.form.emergencyLevel", "Emergency Level")}
          error={errors.emergency_level?.message}
          options={EMERGENCY_LEVEL_OPTIONS.map((level) => ({
            value: level,
            label: t(`recipients.emergency.${level}`, level),
          }))}
          {...register("emergency_level")}
        />
        <Select
          label={t("recipients.form.status", "Status")}
          error={errors.status?.message}
          options={RECIPIENT_STATUS_OPTIONS.map((status) => ({
            value: status,
            label: t(`recipients.status.${status}`, status),
          }))}
          {...register("status")}
        />
      </div>

      {(createdAt || updatedAt) && (
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label={t("recipients.form.createdAt", "Created At")}
            value={createdAt ? formatLocalDateTime(createdAt) : "-"}
            readOnly
          />
          <Input
            label={t("recipients.form.updatedAt", "Updated At")}
            value={updatedAt ? formatLocalDateTime(updatedAt) : "-"}
            readOnly
          />
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t("recipients.actions.cancel", "Cancel")}
        </Button>
        <Button type="submit" loading={loading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
