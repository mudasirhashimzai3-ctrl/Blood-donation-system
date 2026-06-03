import {
  ArrowLeft,
  CheckCircle2,
  Pencil,
  Trash2,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { PageHeader } from "@/components";
import useCan from "@/hooks/useCan";
import { useUserStore } from "@/modules/auth/stores/useUserStore";
import { getBloodRequestsRouteByRole } from "@/modules/auth/utils/roleRouting";
import { formatLocalDateTime } from "@/utils/formatLocalDateTime";
import { Badge, Button, Card, CardContent } from "@components/ui";
import BloodRequestStatusBadge from "../components/BloodRequestStatusBadge";
import BloodRequestTypeBadge from "../components/BloodRequestTypeBadge";
import CancelBloodRequestDialog from "../components/CancelBloodRequestDialog";
import CompleteBloodRequestDialog from "../components/CompleteBloodRequestDialog";
import DonorCandidatesPanel from "../components/DonorCandidatesPanel";
import {
  useBloodRequest,
  useBloodRequestNotifications,
  useCancelBloodRequest,
  useCompleteBloodRequest,
  useDeleteBloodRequest,
} from "../queries/useBloodRequestQueries";

export default function BloodRequestViewPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { can } = useCan();
  const userRole = useUserStore((state) => state.userProfile?.role);
  const { id } = useParams<{ id: string }>();
  const bloodRequestId = Number(id);

  const [isCancelOpen, setIsCancelOpen] = useState(false);
  const [isCompleteOpen, setIsCompleteOpen] = useState(false);

  const { data: bloodRequest, isLoading, error } = useBloodRequest(bloodRequestId, {
    enabled: Number.isFinite(bloodRequestId),
  });
  const { data: notifications = [] } = useBloodRequestNotifications(bloodRequestId, {
    enabled: Number.isFinite(bloodRequestId),
  });

  const deleteMutation = useDeleteBloodRequest();
  const completeMutation = useCompleteBloodRequest(bloodRequestId);
  const cancelMutation = useCancelBloodRequest(bloodRequestId);

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

  const isTerminal = bloodRequest.status === "completed" || bloodRequest.status === "cancelled";
  const isRecipientUser = userRole === "recipient";
  const requestBaseRoute = getBloodRequestsRouteByRole(userRole);

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("bloodRequests.view.title", "Blood Request Details")}
        subtitle={t("bloodRequests.view.subtitle", "View request workflow and donor matches")}
      />

      <Card>
        <CardContent className="space-y-6">
          <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-text-primary">{bloodRequest.recipient_name}</h2>
              <p className="text-sm text-text-secondary">{bloodRequest.hospital_name}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{bloodRequest.blood_group}</Badge>
              <BloodRequestTypeBadge requestType={bloodRequest.request_type} />
              <BloodRequestStatusBadge status={bloodRequest.status} />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs uppercase text-text-secondary">{t("bloodRequests.form.unitsNeeded", "Units Needed")}</p>
              <p className="text-sm text-text-primary">{bloodRequest.units_needed}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-text-secondary">
                {t("bloodRequests.form.responseDeadline", "Response Deadline")}
              </p>
              <p className="text-sm text-text-primary">
                {bloodRequest.response_deadline
                  ? formatLocalDateTime(bloodRequest.response_deadline)
                  : "-"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase text-text-secondary">{t("bloodRequests.form.latitude", "Latitude")}</p>
              <p className="text-sm text-text-primary">{bloodRequest.location_lat}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-text-secondary">{t("bloodRequests.form.longitude", "Longitude")}</p>
              <p className="text-sm text-text-primary">{bloodRequest.location_lon}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-text-secondary">{t("bloodRequests.view.nearbyDonors", "Nearby Donors")}</p>
              <p className="text-sm text-text-primary">{bloodRequest.nearby_donors_count}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-text-secondary">
                {t("bloodRequests.view.notifiedDonors", "Total Notified Donors")}
              </p>
              <p className="text-sm text-text-primary">{bloodRequest.total_notified_donors}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-text-secondary">{t("bloodRequests.view.assignedDonor", "Assigned Donor")}</p>
              <p className="text-sm text-text-primary">{bloodRequest.assigned_donor_name || "-"}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-text-secondary">{t("bloodRequests.view.verified", "Verified")}</p>
              <p className="text-sm text-text-primary">
                {bloodRequest.is_verified
                  ? t("bloodRequests.actions.verified", "Verified")
                  : t("bloodRequests.actions.unverified", "Unverified")}
              </p>
            </div>
          </div>

          <div className="grid gap-2 md:grid-cols-3">
            {bloodRequest.medical_report_url ? (
              <a
                href={bloodRequest.medical_report_url}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-border px-3 py-2 text-sm text-primary hover:bg-primary/5"
              >
                {t("bloodRequests.form.medicalReport", "Medical Report")}
              </a>
            ) : null}
            {bloodRequest.prescription_image_url ? (
              <a
                href={bloodRequest.prescription_image_url}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-border px-3 py-2 text-sm text-primary hover:bg-primary/5"
              >
                {t("bloodRequests.form.prescriptionImage", "Prescription Image")}
              </a>
            ) : null}
            {bloodRequest.emergency_proof_url ? (
              <a
                href={bloodRequest.emergency_proof_url}
                target="_blank"
                rel="noreferrer"
                className="rounded-lg border border-border px-3 py-2 text-sm text-primary hover:bg-primary/5"
              >
                {t("bloodRequests.form.emergencyProof", "Emergency Proof")}
              </a>
            ) : null}
          </div>

          <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
            <Button variant="outline" onClick={() => navigate(requestBaseRoute)} leftIcon={<ArrowLeft className="h-4 w-4" />}>
              {t("bloodRequests.actions.backToList", "Back to list")}
            </Button>

            {!isTerminal ? (
              <Button
                variant="outline"
                onClick={() => navigate(`${requestBaseRoute}/${bloodRequest.id}/edit`)}
                leftIcon={<Pencil className="h-4 w-4" />}
              >
                {t("bloodRequests.actions.edit", "Edit")}
              </Button>
            ) : null}

            {!isRecipientUser && bloodRequest.status === "matched" ? (
              <Button variant="primary" onClick={() => setIsCompleteOpen(true)} leftIcon={<CheckCircle2 className="h-4 w-4" />}>
                {t("bloodRequests.actions.complete", "Complete")}
              </Button>
            ) : null}

            {!isTerminal ? (
              <>
                <Button variant="danger" onClick={() => setIsCancelOpen(true)} leftIcon={<XCircle className="h-4 w-4" />}>
                  {t("bloodRequests.actions.cancelRequest", "Cancel Request")}
                </Button>
              </>
            ) : null}

            {!isRecipientUser ? (
              <Button
                variant="danger"
                leftIcon={<Trash2 className="h-4 w-4" />}
                loading={deleteMutation.isPending}
                onClick={async () => {
                  if (!window.confirm(t("bloodRequests.delete.confirm", "Delete this blood request?"))) return;
                  await deleteMutation.mutateAsync(bloodRequest.id);
                  navigate(requestBaseRoute);
                }}
              >
                {t("bloodRequests.actions.delete", "Delete")}
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>

      {!isRecipientUser ? (
        <DonorCandidatesPanel
          notifications={notifications}
        />
      ) : null}

      <CancelBloodRequestDialog
        isOpen={isCancelOpen}
        onClose={() => setIsCancelOpen(false)}
        onConfirm={async (reason) => {
          await cancelMutation.mutateAsync({
            cancelled_by: isRecipientUser ? "recipient" : "admin",
            rejection_reason: reason,
          });
        }}
        loading={cancelMutation.isPending}
      />

      <CompleteBloodRequestDialog
        isOpen={isCompleteOpen}
        onClose={() => setIsCompleteOpen(false)}
        onConfirm={async () => {
          await completeMutation.mutateAsync();
        }}
        loading={completeMutation.isPending}
      />
    </div>
  );
}
