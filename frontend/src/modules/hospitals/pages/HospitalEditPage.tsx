import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { PageHeader } from "@/components";
import useCan from "@/hooks/useCan";
import { Card, CardContent } from "@components/ui";
import HospitalForm from "../components/HospitalForm";
import { mapHospitalToFormValues, normalizeHospitalPayload, useHospitalForm } from "../hooks/useHospitalForm";
import type { HospitalFormValues } from "../schemas/hospitalSchemas";
import { useHospital, useUpdateHospital } from "../queries/useHospitalQueries";

export default function HospitalEditPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { can } = useCan();
  const { id } = useParams<{ id: string }>();
  const hospitalId = Number(id);
  const form = useHospitalForm();

  const { data: hospital, isLoading, error } = useHospital(hospitalId, { enabled: Number.isFinite(hospitalId) });
  const updateMutation = useUpdateHospital(hospitalId);

  useEffect(() => {
    if (hospital) {
      form.reset(mapHospitalToFormValues(hospital));
    }
  }, [hospital, form]);

  const onSubmit = async (values: HospitalFormValues) => {
    await updateMutation.mutateAsync(normalizeHospitalPayload(values));
    navigate(`/hospitals/${hospitalId}`);
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

  if (!Number.isFinite(hospitalId)) {
    return (
      <Card>
        <CardContent className="text-sm text-error">{t("hospitals.errors.notFound", "Hospital not found")}</CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent>{t("hospitals.loading", "Loading hospital details...")}</CardContent>
      </Card>
    );
  }

  if (error || !hospital) {
    return (
      <Card>
        <CardContent className="text-sm text-error">
          {t("hospitals.errors.loadFailed", "Failed to load hospital details")}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("hospitals.edit.title", "Edit Hospital")}
        subtitle={t("hospitals.edit.subtitle", "Update hospital information")}
      />

      <Card>
        <CardContent>
          <HospitalForm
            form={form}
            onSubmit={onSubmit}
            onCancel={() => navigate(`/hospitals/${hospitalId}`)}
            submitLabel={t("hospitals.actions.update", "Update Hospital")}
            loading={updateMutation.isPending}
            createdAt={hospital.created_at}
            updatedAt={hospital.updated_at}
          />
        </CardContent>
      </Card>
    </div>
  );
}

