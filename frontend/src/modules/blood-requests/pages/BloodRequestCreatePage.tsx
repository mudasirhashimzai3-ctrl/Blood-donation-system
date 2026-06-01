import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { PageHeader } from "@/components";
import useCan from "@/hooks/useCan";
import { useUserStore } from "@/modules/auth/stores/useUserStore";
import { Card, CardContent } from "@components/ui";
import BloodRequestForm from "../components/BloodRequestForm";
import {
  normalizeBloodRequestPayload,
  useBloodRequestForm,
} from "../hooks/useBloodRequestForm";
import type { BloodRequestFormValues } from "../schemas/bloodRequestSchemas";
import { useCreateBloodRequest } from "../queries/useBloodRequestQueries";
import {
  getBloodRequestsRouteByRole,
} from "@/modules/auth/utils/roleRouting";

export default function BloodRequestCreatePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const { can } = useCan();
  const userRole = useUserStore((state) => state.userProfile?.role);
  const form = useBloodRequestForm();
  const createMutation = useCreateBloodRequest();
  const isRecipient = userRole === "recipient";
  const isAdmin = userRole === "admin";
  const isEmergencyRoute = location.pathname.includes("/recipient/emergency-request");

  useEffect(() => {
    if (isEmergencyRoute) {
      form.setValue("request_type", "critical");
    }
  }, [form, isEmergencyRoute]);

  const onSubmit = async (values: BloodRequestFormValues) => {
    try {
      await createMutation.mutateAsync(normalizeBloodRequestPayload(values));
      navigate(getBloodRequestsRouteByRole(userRole));
    } catch {
      // The mutation handles the toast; keep the submit promise from surfacing as an uncaught error.
    }
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
            onCancel={() => navigate(getBloodRequestsRouteByRole(userRole))}
            submitLabel={t("bloodRequests.actions.save", "Save Request")}
            loading={createMutation.isPending}
            recipientMode={isRecipient}
            adminMode={isAdmin}
          />
        </CardContent>
      </Card>
    </div>
  );
}
