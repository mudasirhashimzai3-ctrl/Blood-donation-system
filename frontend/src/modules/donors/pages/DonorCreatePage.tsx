import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { PageHeader } from "@/components";
import { Card, CardContent } from "@components/ui";
import useCan from "@/hooks/useCan";
import DonorForm from "../components/DonorForm";
import { type DonorFormValues } from "../schemas/donorSchemas";
import { useCreateDonor } from "../queries/useDonorQueries";
import { useDonorForm } from "../hooks/useDonorForm";

const emptyToNull = (value?: string) => {
  if (!value || value.trim() === "") return null;
  return value;
};

export default function DonorCreatePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { can } = useCan();
  const form = useDonorForm();
  const createMutation = useCreateDonor();

  const onSubmit = async (values: DonorFormValues) => {
    await createMutation.mutateAsync({
      ...values,
      email: emptyToNull(values.email),
      date_of_birth: emptyToNull(values.date_of_birth),
      address: emptyToNull(values.address),
      emergency_contact_name: emptyToNull(values.emergency_contact_name),
      emergency_contact_phone: emptyToNull(values.emergency_contact_phone),
      last_donation_date: emptyToNull(values.last_donation_date),
      latitude: emptyToNull(values.latitude),
      longitude: emptyToNull(values.longitude),
      notes: emptyToNull(values.notes),
    });
    navigate("/donors");
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

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("donors.create.title", "Create Donor")}
        subtitle={t("donors.create.subtitle", "Add a new donor record")}
      />

      <Card>
        <CardContent>
          <DonorForm
            form={form}
            onSubmit={onSubmit}
            onCancel={() => navigate("/donors")}
            submitLabel={t("donors.actions.save", "Save Donor")}
            loading={createMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}
