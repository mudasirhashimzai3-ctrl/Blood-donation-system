import { Controller, type UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Button, Input, Switch } from "@components/ui";
import { formatLocalDateTime } from "@/utils/formatLocalDateTime";
import { type HospitalFormValues } from "../schemas/hospitalSchemas";

interface HospitalFormProps {
  form: UseFormReturn<HospitalFormValues>;
  onSubmit: (values: HospitalFormValues) => Promise<void> | void;
  onCancel: () => void;
  submitLabel: string;
  loading?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export default function HospitalForm({
  form,
  onSubmit,
  onCancel,
  submitLabel,
  loading = false,
  createdAt,
  updatedAt,
}: HospitalFormProps) {
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
          label={t("hospitals.form.name", "Hospital Name")}
          placeholder={t("hospitals.form.namePlaceholder", "Enter hospital name")}
          error={errors.name?.message}
          {...register("name")}
        />
        <Input
          label={t("hospitals.form.phone", "Phone")}
          placeholder={t("hospitals.form.phonePlaceholder", "Enter phone number")}
          error={errors.phone?.message}
          {...register("phone")}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          type="email"
          label={t("hospitals.form.email", "Email")}
          placeholder={t("hospitals.form.emailPlaceholder", "Enter email")}
          error={errors.email?.message}
          {...register("email")}
        />
        <Input
          label={t("hospitals.form.city", "City")}
          placeholder={t("hospitals.form.cityPlaceholder", "Enter city")}
          error={errors.city?.message}
          {...register("city")}
        />
      </div>

      <Input
        label={t("hospitals.form.address", "Address")}
        placeholder={t("hospitals.form.addressPlaceholder", "Enter address")}
        error={errors.address?.message}
        {...register("address")}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label={t("hospitals.form.latitude", "Latitude")}
          error={errors.latitude?.message}
          {...register("latitude")}
        />
        <Input
          label={t("hospitals.form.longitude", "Longitude")}
          error={errors.longitude?.message}
          {...register("longitude")}
        />
      </div>

      <Controller
        control={control}
        name="is_active"
        render={({ field }) => (
          <Switch
            checked={field.value}
            onChange={(event) => field.onChange(event.target.checked)}
            label={t("hospitals.form.isActive", "Hospital is active")}
            description={t("hospitals.form.isActiveHint", "Inactive hospitals are hidden from recipient selection")}
          />
        )}
      />

      {(createdAt || updatedAt) && (
        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label={t("hospitals.form.createdAt", "Created At")}
            value={createdAt ? formatLocalDateTime(createdAt) : "-"}
            readOnly
          />
          <Input
            label={t("hospitals.form.updatedAt", "Updated At")}
            value={updatedAt ? formatLocalDateTime(updatedAt) : "-"}
            readOnly
          />
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t("hospitals.actions.cancel", "Cancel")}
        </Button>
        <Button type="submit" loading={loading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}

