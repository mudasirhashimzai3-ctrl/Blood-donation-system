import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { PageHeader } from "@/components";
import useCan from "@/hooks/useCan";
import { Card, CardContent } from "@components/ui";
import BloodRequestForm from "../components/BloodRequestForm";
import {
  mapBloodRequestToFormValues,
  normalizeBloodRequestPayload,
  useBloodRequestForm,
} from "../hooks/useBloodRequestForm";
import type { BloodRequestFormValues } from "../schemas/bloodRequestSchemas";
import { useBloodRequest, useUpdateBloodRequest } from "../queries/useBloodRequestQueries";

export default function BloodRequestEditPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { can } = useCan();
  const { id } = useParams<{ id: string }>();
  const bloodRequestId = Number(id);
  const form = useBloodRequestForm();

  const { data: bloodRequest, isLoading, error } = useBloodRequest(bloodRequestId, {
    enabled: Number.isFinite(bloodRequestId),
  });
  const updateMutation = useUpdateBloodRequest(bloodRequestId);

  useEffect(() => {
    if (bloodRequest) {
      form.reset(mapBloodRequestToFormValues(bloodRequest));
    }
  }, [bloodRequest, form]);

  const onSubmit = async (values: BloodRequestFormValues) => {
    await updateMutation.mutateAsync(normalizeBloodRequestPayload(values));
    navigate(`/blood-requests/${bloodRequestId}`);
  };

  if (!can("blood_requests")) {
    return (
      <Card>
        <CardContent className="text-sm text-error">
          {t(
            "bloodRequests.errors.noPermission",
            "You do not have permission to access blood requests."
          )}
        </CardContent>
      </Card>
    );
  }

  if (!Number.isFinite(bloodRequestId)) {
    return (
      <Card>
        <CardContent className="text-sm text-error">
          {t("bloodRequests.errors.notFound", "Blood request not found")}
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent>{t("bloodRequests.loading", "Loading blood request details...")}</CardContent>
      </Card>
    );
  }

  if (error || !bloodRequest) {
    return (
      <Card>
        <CardContent className="text-sm text-error">
          {t("bloodRequests.errors.loadFailed", "Failed to load blood request details")}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("bloodRequests.edit.title", "Edit Blood Request")}
        subtitle={t("bloodRequests.edit.subtitle", "Update blood request information")}
      />

      <Card>
        <CardContent>
          <BloodRequestForm
            form={form}
            onSubmit={onSubmit}
            onCancel={() => navigate(`/blood-requests/${bloodRequestId}`)}
            submitLabel={t("bloodRequests.actions.update", "Update Request")}
            loading={updateMutation.isPending}
            medicalReportUrl={bloodRequest.medical_report_url}
            prescriptionImageUrl={bloodRequest.prescription_image_url}
            emergencyProofUrl={bloodRequest.emergency_proof_url}
          />
        </CardContent>
      </Card>
    </div>
  );
}
