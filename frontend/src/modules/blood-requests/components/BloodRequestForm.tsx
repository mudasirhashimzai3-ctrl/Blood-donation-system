import { useEffect, useState } from "react";
import { Controller, type UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Plus } from "lucide-react";

import {
  AFGHANISTAN_PROVINCES,
  HospitalQuickCreateModal,
  useHospital,
  useHospitalsList,
} from "@/modules/hospitals";
import type { Province } from "@/modules/hospitals";
import { Button, Input, Select, Switch } from "@components/ui";
import { type BloodRequestFormValues } from "../schemas/bloodRequestSchemas";
import { useBloodRequestRecipientsList } from "../queries/useBloodRequestQueries";
import { BLOOD_GROUP_OPTIONS, REQUEST_TYPE_OPTIONS } from "../types/bloodRequest.types";

interface BloodRequestFormProps {
  form: UseFormReturn<BloodRequestFormValues>;
  onSubmit: (values: BloodRequestFormValues) => Promise<void> | void;
  onCancel: () => void;
  submitLabel: string;
  loading?: boolean;
  medicalReportUrl?: string | null;
  prescriptionImageUrl?: string | null;
  emergencyProofUrl?: string | null;
  recipientMode?: boolean;
  adminMode?: boolean;
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
  recipientMode = false,
  adminMode = false,
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
  const [isQuickCreateOpen, setIsQuickCreateOpen] = useState(false);
  const [quickCreatedHospital, setQuickCreatedHospital] = useState<{
    id: number;
    name: string;
    province: Province;
  } | null>(null);
  const { data: selectedHospital } = useHospital(selectedHospitalId, { enabled: selectedHospitalId > 0 });
  const { data: hospitalsData } = useHospitalsList(
    { page_size: 200, province: province || undefined },
    { enabled: Boolean(province) }
  );
  const { data: recipientsData } = useBloodRequestRecipientsList("", { enabled: adminMode });

  const hospitals = hospitalsData?.results ?? [];
  const selectableHospitals =
    quickCreatedHospital &&
    (!province || quickCreatedHospital.province === province) &&
    !hospitals.some((hospital) => hospital.id === quickCreatedHospital.id)
      ? [quickCreatedHospital, ...hospitals]
      : hospitals;

  useEffect(() => {
    if (!province && selectedHospital?.province) {
      setProvince(selectedHospital.province);
    }
  }, [province, selectedHospital]);

  useEffect(() => {
    if (!selectedHospital) return;
    setValue("location_lat", selectedHospital.latitude ? String(selectedHospital.latitude) : "", {
      shouldDirty: true,
      shouldValidate: true,
    });
    setValue("location_lon", selectedHospital.longitude ? String(selectedHospital.longitude) : "", {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [selectedHospital, setValue]);

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-4 rounded-xl border border-border p-4">
        <h3 className="text-sm font-semibold text-text-primary">
          {t("bloodRequests.form.section.location", "Location & Hospital")}
        </h3>
        {adminMode ? (
          <Controller
            control={control}
            name="recipient"
            render={({ field }) => (
              <Select
                label={t("bloodRequests.form.recipient", "Recipient")}
                error={errors.recipient?.message}
                value={String(field.value || "")}
                options={[
                  { value: "", label: t("bloodRequests.form.recipientPlaceholder", "Select recipient") },
                  ...(recipientsData?.results ?? []).map((item) => ({
                    value: String(item.id),
                    label: `${item.full_name} (${item.phone})`,
                  })),
                ]}
                onChange={(event) => field.onChange(Number(event.target.value))}
              />
            )}
          />
        ) : null}
        <div className="grid gap-4 md:grid-cols-2">
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
              setValue("location_lat", "", { shouldDirty: true, shouldValidate: true });
              setValue("location_lon", "", { shouldDirty: true, shouldValidate: true });
            }}
          />
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
                  ...selectableHospitals.map((hospital) => ({
                    value: String(hospital.id),
                    label: hospital.name,
                  })),
                ]}
                onChange={(event) => field.onChange(Number(event.target.value))}
                disabled={!province}
              />
            )}
          />
        </div>
        <div className="flex justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            leftIcon={<Plus className="h-4 w-4" />}
            disabled={!province}
            onClick={() => setIsQuickCreateOpen(true)}
          >
            {t("bloodRequests.actions.addHospital", "Add Hospital")}
          </Button>
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-border p-4">
        <h3 className="text-sm font-semibold text-text-primary">
          {t("bloodRequests.form.section.request", "Request Details")}
        </h3>
        <div className="grid gap-4 md:grid-cols-3">
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
          <Select
            label={t("bloodRequests.form.requestType", "Urgency Status")}
            error={errors.request_type?.message}
            options={REQUEST_TYPE_OPTIONS.map((value) => ({
              value,
              label: t(`bloodRequests.type.${value}`, value),
            }))}
            {...register("request_type")}
          />
        </div>
      </div>

      {!recipientMode ? (
        <>
          <div className="space-y-4 rounded-xl border border-border p-4">
            <h3 className="text-sm font-semibold text-text-primary">
              {t("bloodRequests.form.section.advanced", "Advanced Settings")}
            </h3>
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
          </div>

          <div className="space-y-4 rounded-xl border border-border p-4">
            <h3 className="text-sm font-semibold text-text-primary">
              {t("bloodRequests.form.section.attachments", "Attachments")}
            </h3>
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
          </div>
        </>
      ) : null}

      <div className="flex items-center justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          {t("bloodRequests.actions.cancel", "Cancel")}
        </Button>
        <Button type="submit" loading={loading}>
          {submitLabel}
        </Button>
      </div>

      <HospitalQuickCreateModal
        isOpen={isQuickCreateOpen}
        onClose={() => setIsQuickCreateOpen(false)}
        province={province}
        onCreated={(hospital) => {
          setProvince(hospital.province);
          setQuickCreatedHospital({
            id: hospital.id,
            name: hospital.name,
            province: hospital.province,
          });
          setValue("hospital", hospital.id, { shouldDirty: true, shouldValidate: true });
          setValue("location_lat", hospital.latitude ?? "", { shouldDirty: true, shouldValidate: true });
          setValue("location_lon", hospital.longitude ?? "", { shouldDirty: true, shouldValidate: true });
          setIsQuickCreateOpen(false);
        }}
      />
    </form>
  );
}
