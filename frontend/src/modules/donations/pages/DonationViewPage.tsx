import { ArrowLeft } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { PageHeader } from "@/components";
import useCan from "@/hooks/useCan";
import { formatLocalDateTime } from "@/utils/formatLocalDateTime";
import { Badge, Button, Card, CardContent } from "@components/ui";
import DonationActionsPanel from "../components/DonationActionsPanel";
import DonationStatusBadge from "../components/DonationStatusBadge";
import DonationTimeline from "../components/DonationTimeline";
import { useDonationActions } from "../hooks/useDonationActions";
import { useDonation } from "../queries/useDonationQueries";

export default function DonationViewPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { can } = useCan();
  const { id } = useParams<{ id: string }>();
  const donationId = Number(id);

  const { data: donation, isLoading, error } = useDonation(donationId, {
    enabled: Number.isFinite(donationId),
  });
  const actions = useDonationActions(donationId);

  if (!can("donations")) {
    return (
      <Card>
        <CardContent className="text-sm text-error">
          {t("donations.errors.noPermission", "You do not have permission to access donations.")}
        </CardContent>
      </Card>
    );
  }

  if (!Number.isFinite(donationId)) {
    return (
      <Card>
        <CardContent className="text-sm text-error">
          {t("donations.errors.notFound", "Donation not found")}
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent>{t("donations.loading", "Loading donation details...")}</CardContent>
      </Card>
    );
  }

  if (error || !donation) {
    return (
      <Card>
        <CardContent className="text-sm text-error">
          {t("donations.errors.loadFailed", "Failed to load donation details")}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("donations.view.title", "Donation Details")}
        subtitle={t("donations.view.subtitle", "Review lifecycle, response and reminder details")}
      />

      <Card>
        <CardContent className="space-y-5">
          <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-text-primary">{donation.donor_name}</h2>
              <p className="text-sm text-text-secondary">
                #{donation.request} - {donation.recipient_name}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <DonationStatusBadge status={donation.status} />
              {donation.is_primary ? (
                <Badge variant="primary">{t("donations.labels.primary", "Primary")}</Badge>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs uppercase text-text-secondary">
                {t("donations.fields.distance", "Distance")}
              </p>
              <p className="text-sm text-text-primary">{donation.distance_km} km</p>
            </div>
            <div>
              <p className="text-xs uppercase text-text-secondary">{t("donations.fields.eta", "ETA")}</p>
              <p className="text-sm text-text-primary">
                {donation.estimated_arrival_time ? `${donation.estimated_arrival_time} min` : "-"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase text-text-secondary">
                {t("donations.fields.responseTime", "Response Time")}
              </p>
              <p className="text-sm text-text-primary">
                {donation.response_time !== null ? `${donation.response_time} min` : "-"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase text-text-secondary">
                {t("donations.fields.priorityScore", "Priority Score")}
              </p>
              <p className="text-sm text-text-primary">{donation.priority_score}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-text-secondary">
                {t("donations.fields.requestDeadline", "Request Deadline")}
              </p>
              <p className="text-sm text-text-primary">
                {donation.request_response_deadline
                  ? formatLocalDateTime(donation.request_response_deadline)
                  : "-"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase text-text-secondary">
                {t("donations.fields.remindersSent", "Reminders Sent")}
              </p>
              <p className="text-sm text-text-primary">{donation.reminder_count}</p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs uppercase text-text-secondary">
                {t("donations.dynamic.nearbyCount", "Nearby Donors (Dynamic)")}
              </p>
              <p className="text-sm text-text-primary">{donation.nearby_donors_count_dynamic}</p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs uppercase text-text-secondary">
                {t("donations.dynamic.bestEta", "Estimated Time (Dynamic)")}
              </p>
              <p className="text-sm text-text-primary">
                {donation.estimated_time_dynamic ? `${donation.estimated_time_dynamic} min` : "-"}
              </p>
            </div>
            <div className="rounded-lg border border-border p-3">
              <p className="text-xs uppercase text-text-secondary">
                {t("donations.dynamic.closestDistance", "Distance (Dynamic)")}
              </p>
              <p className="text-sm text-text-primary">
                {donation.distance_dynamic ? `${donation.distance_dynamic} km` : "-"}
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              variant="outline"
              leftIcon={<ArrowLeft className="h-4 w-4" />}
              onClick={() => navigate("/donations")}
            >
              {t("donations.actions.backToList", "Back to list")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <DonationActionsPanel
        donation={donation}
        onStatusUpdate={actions.updateStatus}
        onSetPrimary={actions.setPrimary}
        onRefreshEstimate={actions.refreshEstimate}
        onSendReminder={async (channels) => {
          await actions.sendReminder({ channels });
        }}
        loadingStates={{
          status: actions.isUpdatingStatus,
          primary: actions.isSettingPrimary,
          estimate: actions.isRefreshingEstimate,
          reminder: actions.isSendingReminder,
        }}
      />

      <DonationTimeline donation={donation} />
    </div>
  );
}
