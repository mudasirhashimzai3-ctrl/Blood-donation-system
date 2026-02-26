import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { PageHeader } from "@/components";
import useCan from "@/hooks/useCan";
import { Card, CardContent } from "@components/ui";
import HospitalForm from "../components/HospitalForm";
import { normalizeHospitalPayload, useHospitalForm } from "../hooks/useHospitalForm";
import type { HospitalFormValues } from "../schemas/hospitalSchemas";
import { useCreateHospital } from "../queries/useHospitalQueries";

export default function HospitalCreatePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { can } = useCan();
  const form = useHospitalForm();
  const createMutation = useCreateHospital();

  const onSubmit = async (values: HospitalFormValues) => {
    await createMutation.mutateAsync(normalizeHospitalPayload(values));
    navigate("/hospitals");
  };

  if (!can("hospitals")) {
    return (
      <Card>
        <CardContent className="text-sm text-error">
          {t("hospitals.errors.noPermission", "You do not have permission to access hospitals.")}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("hospitals.create.title", "Create Hospital")}
        subtitle={t("hospitals.create.subtitle", "Add a new hospital record")}
      />

      <Card>
        <CardContent>
          <HospitalForm
            form={form}
            onSubmit={onSubmit}
            onCancel={() => navigate("/hospitals")}
            submitLabel={t("hospitals.actions.save", "Save Hospital")}
            loading={createMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}

