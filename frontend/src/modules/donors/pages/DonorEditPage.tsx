import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { PageHeader } from "@/components";
import { Card, CardContent } from "@components/ui";
import useCan from "@/hooks/useCan";
import DonorForm from "../components/DonorForm";
import { mapDonorToFormValues, useDonorForm } from "../hooks/useDonorForm";
import { type DonorFormValues } from "../schemas/donorSchemas";
import { useDonor, useUpdateDonor } from "../queries/useDonorQueries";

const emptyToNull = (value?: string) => {
  if (!value || value.trim() === "") return null;
  return value;
};

export default function DonorEditPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { can } = useCan();
  const { id } = useParams<{ id: string }>();
  const donorId = Number(id);
  const form = useDonorForm();

  const { data: donor, isLoading, error } = useDonor(donorId, { enabled: Number.isFinite(donorId) });
  const updateMutation = useUpdateDonor(donorId);

  useEffect(() => {
    if (donor) {
      form.reset(mapDonorToFormValues(donor));
    }
  }, [donor, form]);

  const onSubmit = async (values: DonorFormValues) => {
    await updateMutation.mutateAsync({
      ...values,
      email: emptyToNull(values.email),
      date_of_birth: emptyToNull(values.date_of_birth),
      address: emptyToNull(values.address),
      emergency_contact_name: emptyToNull(values.emergency_contact_name),
      emergency_contact_phone: emptyToNull(values.emergency_contact_phone),
      last_donation_date: emptyToNull(values.last_donation_date),
      notes: emptyToNull(values.notes),
    });
    navigate(`/donors/${donorId}`);
  };

  if (!can("donors")) {
    return (
      <Card>
        <CardContent className="text-sm text-error">
          {t("donors.errors.noPermission", "You do not have permission to access donors.")}
        </CardContent>
      </Card>
    );
  }

  if (!Number.isFinite(donorId)) {
    return (
      <Card>
        <CardContent className="text-sm text-error">{t("donors.errors.notFound", "Donor not found")}</CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent>{t("donors.loading", "Loading donor details...")}</CardContent>
      </Card>
    );
  }

  if (error || !donor) {
    return (
      <Card>
        <CardContent className="text-sm text-error">{t("donors.errors.loadFailed", "Failed to load donor details")}</CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("donors.edit.title", "Edit Donor")}
        subtitle={t("donors.edit.subtitle", "Update donor profile information")}
      />

      <Card>
        <CardContent>
          <DonorForm
            form={form}
            onSubmit={onSubmit}
            onCancel={() => navigate(`/donors/${donorId}`)}
            submitLabel={t("donors.actions.update", "Update Donor")}
            loading={updateMutation.isPending}
            existingProfilePictureUrl={donor.profile_picture_url}
          />
        </CardContent>
      </Card>
    </div>
  );
}
