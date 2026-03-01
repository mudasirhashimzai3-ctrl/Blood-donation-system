import { useTranslation } from "react-i18next";

import { Card, CardContent } from "@components/ui";
import type { BloodRequestNotification } from "../types/bloodRequest.types";

interface DonorCandidatesPanelProps {
  notifications: BloodRequestNotification[];
  onAssign: (donorId: number) => void;
  disabled?: boolean;
}

export default function DonorCandidatesPanel({
  notifications,
  onAssign,
  disabled = false,
}: DonorCandidatesPanelProps) {
  const { t } = useTranslation();
  const candidates = notifications.filter((item) => item.response_status !== "expired");

  return (
    <Card>
      <CardContent className="space-y-3">
        <h3 className="text-sm font-semibold text-text-primary">
          {t("bloodRequests.view.candidates", "Candidate Donors")}
        </h3>
        {candidates.length === 0 ? (
          <p className="text-sm text-text-secondary">
            {t("bloodRequests.view.noCandidates", "No candidate donors found yet.")}
          </p>
        ) : (
          <div className="space-y-2">
            {candidates.map((notification) => (
              <div
                key={notification.id}
                className="flex flex-col gap-2 rounded-lg border border-border p-3 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-text-primary">{notification.donor_name}</p>
                  <p className="text-xs text-text-secondary">
                    {notification.donor_phone} - {notification.distance_km} km
                  </p>
                  <p className="text-xs text-text-secondary">
                    {t(`bloodRequests.notification.${notification.response_status}`, notification.response_status)}
                  </p>
                </div>
                <button
                  type="button"
                  className="rounded-lg border border-primary px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => onAssign(notification.donor)}
                  disabled={disabled}
                >
                  {t("bloodRequests.actions.assign", "Assign")}
                </button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
