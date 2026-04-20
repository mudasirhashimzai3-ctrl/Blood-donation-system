import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

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
      is_active: true,
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
      is_active: true,
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
      is_active: true,
    });
    onCreated(hospital);
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
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
      <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <Input label={t("hospitals.form.name", "Hospital Name")} error={errors.name?.message} {...register("name")} />
        <Input label={t("hospitals.form.phone", "Phone")} error={errors.phone?.message} {...register("phone")} />
        <Input
          type="email"
          label={t("hospitals.form.email", "Email")}
          error={errors.email?.message}
          {...register("email")}
        />
        <Select
          label={t("hospitals.form.province", "Province")}
          error={errors.province?.message}
          options={AFGHANISTAN_PROVINCES.map((value) => ({ value, label: value }))}
          {...register("province")}
        />
        <Input
          label={t("hospitals.form.address", "Address")}
          error={errors.address?.message}
          {...register("address")}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <Input label={t("hospitals.form.latitude", "Latitude")} error={errors.latitude?.message} {...register("latitude")} />
          <Input
            label={t("hospitals.form.longitude", "Longitude")}
            error={errors.longitude?.message}
            {...register("longitude")}
          />
        </div>
      </form>
    </Modal>
  );
}
