import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Building2, Mail, MapPin, Phone } from "lucide-react";

import { Button, Input, Modal, Select } from "@components/ui";
import { hospitalFormSchema, type HospitalFormValues } from "../schemas/hospitalSchemas";
import { useCreateHospital } from "../queries/useHospitalQueries";
import { AFGHANISTAN_PROVINCES, type Hospital, type Province } from "../types/hospital.types";

interface HospitalQuickCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (hospital: Hospital) => void;
  province?: Province | "";
}

const emptyToNull = (value?: string) => {
  if (!value || value.trim() === "") return null;
  return value.trim();
};

export default function HospitalQuickCreateModal({
  isOpen,
  onClose,
  onCreated,
  province = "",
}: HospitalQuickCreateModalProps) {
  const { t } = useTranslation();
  const createHospital = useCreateHospital();
  const form = useForm<HospitalFormValues>({
    resolver: zodResolver(hospitalFormSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      address: "",
      province: province || "Kabul",
      latitude: "",
      longitude: "",
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = form;

  useEffect(() => {
    if (!isOpen) return;
    reset({
      name: "",
      phone: "",
      email: "",
      address: "",
      province: province || "Kabul",
      latitude: "",
      longitude: "",
    });
  }, [isOpen, province, reset]);

  const onSubmit = async (values: HospitalFormValues) => {
    const hospital = await createHospital.mutateAsync({
      name: values.name.trim(),
      phone: emptyToNull(values.phone),
      email: emptyToNull(values.email),
      address: emptyToNull(values.address),
      province: values.province,
      city: values.province,
      latitude: emptyToNull(values.latitude),
      longitude: emptyToNull(values.longitude),
    });
    onCreated(hospital);
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={t("hospitals.quickCreate.title", "Quick Create Hospital")}
      description={t("hospitals.quickCreate.subtitle", "Create a hospital and select it immediately")}
      footer={
        <>
          <Button
            variant="outline"
            onClick={() => {
              reset();
              onClose();
            }}
            disabled={createHospital.isPending}
          >
            {t("hospitals.actions.cancel", "Cancel")}
          </Button>
          <Button onClick={handleSubmit(onSubmit)} loading={createHospital.isPending}>
            {t("hospitals.quickCreate.create", "Create Hospital")}
          </Button>
        </>
      }
    >
      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-4 md:grid-cols-[1.35fr_1fr]">
          <Input
            label={t("hospitals.form.name", "Hospital Name")}
            placeholder={t("hospitals.form.namePlaceholder", "Enter hospital name")}
            leftIcon={<Building2 className="h-4 w-4" />}
            error={errors.name?.message}
            {...register("name")}
          />
          <Select
            label={t("hospitals.form.province", "Province")}
            leftIcon={<MapPin className="h-4 w-4" />}
            error={errors.province?.message}
            options={AFGHANISTAN_PROVINCES.map((value) => ({ value, label: value }))}
            {...register("province")}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            type="tel"
            inputMode="numeric"
            maxLength={10}
            pattern="[0-9]{10}"
            label={t("hospitals.form.phone", "Phone")}
            placeholder={t("hospitals.form.phonePlaceholder", "0700000000")}
            leftIcon={<Phone className="h-4 w-4" />}
            error={errors.phone?.message}
            onInput={(event) => {
              const input = event.currentTarget;
              input.value = input.value.replace(/\D/g, "").slice(0, 10);
            }}
            {...register("phone")}
          />
          <Input
            type="email"
            label={t("hospitals.form.email", "Email")}
            placeholder={t("hospitals.form.emailPlaceholder", "Enter email")}
            leftIcon={<Mail className="h-4 w-4" />}
            error={errors.email?.message}
            {...register("email")}
          />
        </div>

        <Input
          label={t("hospitals.form.address", "Address")}
          placeholder={t("hospitals.form.addressPlaceholder", "Enter address")}
          leftIcon={<MapPin className="h-4 w-4" />}
          error={errors.address?.message}
          {...register("address")}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <Input
            label={t("hospitals.form.latitude", "Latitude")}
            placeholder="34.5553"
            error={errors.latitude?.message}
            {...register("latitude")}
          />
          <Input
            label={t("hospitals.form.longitude", "Longitude")}
            placeholder="69.2075"
            error={errors.longitude?.message}
            {...register("longitude")}
          />
        </div>
      </form>
    </Modal>
  );
}
