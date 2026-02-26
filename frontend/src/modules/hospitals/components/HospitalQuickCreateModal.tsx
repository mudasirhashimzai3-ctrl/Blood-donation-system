import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";

import { Button, Input, Modal } from "@components/ui";
import { hospitalFormSchema, type HospitalFormValues } from "../schemas/hospitalSchemas";
import { useCreateHospital } from "../queries/useHospitalQueries";
import type { Hospital } from "../types/hospital.types";

interface HospitalQuickCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (hospital: Hospital) => void;
}

const emptyToNull = (value?: string) => {
  if (!value || value.trim() === "") return null;
  return value.trim();
};

export default function HospitalQuickCreateModal({
  isOpen,
  onClose,
  onCreated,
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
      city: "",
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

  const onSubmit = async (values: HospitalFormValues) => {
    const hospital = await createHospital.mutateAsync({
      name: values.name.trim(),
      phone: emptyToNull(values.phone),
      email: emptyToNull(values.email),
      address: emptyToNull(values.address),
      city: values.city.trim(),
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
        <Input label={t("hospitals.form.city", "City")} error={errors.city?.message} {...register("city")} />
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

