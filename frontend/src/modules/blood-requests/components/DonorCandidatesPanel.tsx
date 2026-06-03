import { useTranslation } from "react-i18next";

import { Card, CardContent } from "@components/ui";
import type { BloodRequestNotification } from "../types/bloodRequest.types";

interface DonorCandidatesPanelProps {
  notifications: BloodRequestNotification[];
}

export default function DonorCandidatesPanel({
  notifications,
}: DonorCandidatesPanelProps) {
  const { t } = useTranslation();

  return (
    <Card>
      <CardContent className="space-y-3">
        <h3 className="text-sm font-semibold text-text-primary">
          {t("bloodRequests.view.candidates", "Candidate Donors")}
        </h3>
        {notifications.length === 0 ? (
          <p className="text-sm text-text-secondary">
            {t("bloodRequests.view.noCandidates", "No candidate donors found yet.")}
          </p>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => (
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
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
