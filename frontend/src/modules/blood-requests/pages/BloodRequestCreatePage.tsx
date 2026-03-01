import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { PageHeader } from "@/components";
import useCan from "@/hooks/useCan";
import { Card, CardContent } from "@components/ui";
import BloodRequestForm from "../components/BloodRequestForm";
import {
  normalizeBloodRequestPayload,
  useBloodRequestForm,
} from "../hooks/useBloodRequestForm";
import type { BloodRequestFormValues } from "../schemas/bloodRequestSchemas";
import { useCreateBloodRequest } from "../queries/useBloodRequestQueries";

export default function BloodRequestCreatePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { can } = useCan();
  const form = useBloodRequestForm();
  const createMutation = useCreateBloodRequest();

  const onSubmit = async (values: BloodRequestFormValues) => {
    await createMutation.mutateAsync(normalizeBloodRequestPayload(values));
    navigate("/blood-requests");
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

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("bloodRequests.create.title", "Create Blood Request")}
        subtitle={t("bloodRequests.create.subtitle", "Submit a new blood request")}
      />

      <Card>
        <CardContent>
          <BloodRequestForm
            form={form}
            onSubmit={onSubmit}
            onCancel={() => navigate("/blood-requests")}
            submitLabel={t("bloodRequests.actions.save", "Save Request")}
            loading={createMutation.isPending}
          />
        </CardContent>
      </Card>
    </div>
  );
}
