import { useEffect, useState } from "react";
import { Controller, type UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { AFGHANISTAN_PROVINCES, useHospital, useHospitalsList } from "@/modules/hospitals";
import type { Province } from "@/modules/hospitals";
import { Button, Input, Select, Switch } from "@components/ui";
import { type BloodRequestFormValues } from "../schemas/bloodRequestSchemas";
import {
  BLOOD_GROUP_OPTIONS,
  PRIORITY_OPTIONS,
  REQUEST_TYPE_OPTIONS,
} from "../types/bloodRequest.types";

interface BloodRequestFormProps {
  form: UseFormReturn<BloodRequestFormValues>;
  onSubmit: (values: BloodRequestFormValues) => Promise<void> | void;
  onCancel: () => void;
  submitLabel: string;
  loading?: boolean;
  medicalReportUrl?: string | null;
  prescriptionImageUrl?: string | null;
  emergencyProofUrl?: string | null;
}

const toDateTimeLocalValue = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 16);
};

export default function BloodRequestForm({
  form,
  onSubmit,
  onCancel,
  submitLabel,
  loading = false,
  medicalReportUrl,
  prescriptionImageUrl,
  emergencyProofUrl,
}: BloodRequestFormProps) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = form;

  const responseDeadline = watch("response_deadline");
  const selectedHospitalId = watch("hospital");
  const [province, setProvince] = useState<Province | "">("");
  const { data: selectedHospital } = useHospital(selectedHospitalId, { enabled: selectedHospitalId > 0 });
  const { data: hospitalsData } = useHospitalsList(
    { page_size: 100, province: province || undefined },
    { enabled: Boolean(province) }
  );

  const hospitals = hospitalsData?.results ?? [];

  useEffect(() => {
    if (!province && selectedHospital?.province) {
      setProvince(selectedHospital.province);
    }
  }, [province, selectedHospital]);

  useEffect(() => {
    if (!selectedHospital) return;
    if (selectedHospital.latitude) {
      setValue("location_lat", String(selectedHospital.latitude), { shouldDirty: true, shouldValidate: true });
    }
    if (selectedHospital.longitude) {
      setValue("location_lon", String(selectedHospital.longitude), { shouldDirty: true, shouldValidate: true });
    }
  }, [selectedHospital, setValue]);

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <Select
        label={t("bloodRequests.form.province", "Province")}
        value={province}
        options={[
          { value: "", label: t("bloodRequests.form.provincePlaceholder", "Select province") },
          ...AFGHANISTAN_PROVINCES.map((value) => ({ value, label: value })),
        ]}
        onChange={(event) => {
          setProvince(event.target.value as Province | "");
          setValue("hospital", 0, { shouldDirty: true, shouldValidate: true });
        }}
      />

      <div className="grid gap-4 md:grid-cols-1">
        <Controller
          control={control}
          name="hospital"
          render={({ field }) => (
            <Select
              label={t("bloodRequests.form.hospital", "Hospital")}
              error={errors.hospital?.message}
              value={String(field.value || "")}
              options={[
                {
                  value: "",
                  label: province
                    ? t("bloodRequests.form.hospitalPlaceholder", "Select hospital")
                    : t("bloodRequests.form.selectProvinceFirst", "Select province first"),
                },
                ...hospitals.map((hospital) => ({
                  value: String(hospital.id),
                  label: `${hospital.name} (${hospital.province})`,
                })),
              ]}
              onChange={(event) => field.onChange(Number(event.target.value))}
              disabled={!province}
            />
          )}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Select
          label={t("bloodRequests.form.bloodGroup", "Blood Group")}
          error={errors.blood_group?.message}
          options={BLOOD_GROUP_OPTIONS.map((group) => ({ value: group, label: group }))}
          {...register("blood_group")}
        />
        <Input
          type="number"
          label={t("bloodRequests.form.unitsNeeded", "Units Needed")}
          error={errors.units_needed?.message}
          {...register("units_needed", { valueAsNumber: true })}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Select
          label={t("bloodRequests.form.requestType", "Request Type")}
          error={errors.request_type?.message}
          options={REQUEST_TYPE_OPTIONS.map((value) => ({
            value,
            label: t(`bloodRequests.type.${value}`, value),
          }))}
          {...register("request_type")}
        />
        <Select
          label={t("bloodRequests.form.priority", "Priority")}
          error={errors.priority?.message}
          options={PRIORITY_OPTIONS.map((value) => ({
            value,
            label: t(`bloodRequests.priority.${value}`, value),
          }))}
          {...register("priority")}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Input
          label={t("bloodRequests.form.latitude", "Latitude")}
          error={errors.location_lat?.message}
          {...register("location_lat")}
        />
        <Input
          label={t("bloodRequests.form.longitude", "Longitude")}
          error={errors.location_lon?.message}
          {...register("location_lon")}
        />
      </div>

      <Input
        type="datetime-local"
        label={t("bloodRequests.form.responseDeadline", "Response Deadline")}
        error={errors.response_deadline?.message}
        value={toDateTimeLocalValue(responseDeadline)}
        onChange={(event) => setValue("response_deadline", event.target.value, { shouldDirty: true })}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Controller
          control={control}
          name="auto_match_enabled"
          render={({ field }) => (
            <Switch
              label={t("bloodRequests.form.autoMatchEnabled", "Auto match enabled")}
              checked={field.value}
              onChange={(event) => field.onChange(event.target.checked)}
            />
          )}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <Input
            type="file"
            label={t("bloodRequests.form.medicalReport", "Medical Report")}
            error={errors.medical_report?.message ? String(errors.medical_report.message) : undefined}
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              setValue("medical_report", file, { shouldDirty: true, shouldValidate: true });
            }}
          />
          {medicalReportUrl ? (
            <a className="text-xs text-primary hover:underline" href={medicalReportUrl} target="_blank" rel="noreferrer">
              {t("bloodRequests.form.viewExisting", "View existing file")}
            </a>
          ) : null}
        </div>
        <div>
          <Input
            type="file"
            accept="image/*"
            label={t("bloodRequests.form.prescriptionImage", "Prescription Image")}
            error={errors.prescription_image?.message ? String(errors.prescription_image.message) : undefined}
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              setValue("prescription_image", file, { shouldDirty: true, shouldValidate: true });
            }}
          />
          {prescriptionImageUrl ? (
            <a className="text-xs text-primary hover:underline" href={prescriptionImageUrl} target="_blank" rel="noreferrer">
              {t("bloodRequests.form.viewExisting", "View existing file")}
            </a>
          ) : null}
        </div>
        <div>
          <Input
            type="file"
            label={t("bloodRequests.form.emergencyProof", "Emergency Proof")}
            error={errors.emergency_proof?.message ? String(errors.emergency_proof.message) : undefined}
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null;
              setValue("emergency_proof", file, { shouldDirty: true, shouldValidate: true });
            }}
          />
          {emergencyProofUrl ? (
            <a className="text-xs text-primary hover:underline" href={emergencyProofUrl} target="_blank" rel="noreferrer">
              {t("bloodRequests.form.viewExisting", "View existing file")}
            </a>
          ) : null}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t("bloodRequests.actions.cancel", "Cancel")}
        </Button>
        <Button type="submit" loading={loading}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
