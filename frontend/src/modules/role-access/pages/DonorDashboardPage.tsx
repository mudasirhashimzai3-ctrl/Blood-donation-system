import { ArrowRight, Bell, Clock3, MapPin, Siren, UserCheck } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { DashboardCard, PageHeader } from "@/components";
import { Button, Card, CardContent } from "@/components/ui";
import { formatLocalDateTime } from "@/utils/formatLocalDateTime";
import { useDonorDashboard } from "../queries/useRoleAccessQueries";

export default function DonorDashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data, isLoading, error } = useDonorDashboard();

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("donor.dashboard.title", "Donor Dashboard")}
        subtitle={t(
          "donor.dashboard.subtitle",
          "Track nearby requests and respond quickly to emergency donations"
        )}
      />

      <div className="grid gap-4 md:grid-cols-3">
        <DashboardCard
          title={t("donor.dashboard.nearby", "Nearby Requests")}
          value={data?.nearby_requests.length ?? 0}
          icon={MapPin}
          color="info"
        />
        <DashboardCard
          title={t("donor.dashboard.emergency", "Emergency Requests")}
          value={data?.emergency_requests.length ?? 0}
          icon={Siren}
          color="error"
        />
        <DashboardCard
          title={t("donor.dashboard.history", "Donation History")}
          value={data?.history_count ?? 0}
          icon={Clock3}
          color="success"
        />
      </div>

      <Card>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-text-primary">
              {t("donor.dashboard.quickActions", "Quick Actions")}
            </h2>
            <Button
              variant="outline"
              leftIcon={<Bell className="h-4 w-4" />}
              onClick={() => navigate("/donor/notifications")}
            >
              {t("donor.dashboard.notifications", "Notifications")}
            </Button>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button onClick={() => navigate("/donor/nearby-requests")}>
              {t("donor.dashboard.viewNearby", "View Nearby Requests")}
            </Button>
            <Button variant="outline" onClick={() => navigate("/donor/emergency-requests")}>
              {t("donor.dashboard.viewEmergency", "View Emergency Requests")}
            </Button>
            <Button variant="outline" onClick={() => navigate("/donor/donation-actions")}>
              {t("donor.dashboard.openActions", "Accept / Reject Donation")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4">
          <h2 className="text-base font-semibold text-text-primary">
            {t("donor.dashboard.nearbyPreview", "Nearby Requests Preview")}
          </h2>

          {isLoading ? <p>{t("common.loading", "Loading...")}</p> : null}
          {error ? (
            <p className="text-sm text-error">
              {t("donor.dashboard.loadError", "Failed to load donor dashboard")}
            </p>
          ) : null}

          {!isLoading && !error && (data?.nearby_requests.length ?? 0) === 0 ? (
            <p className="text-sm text-text-secondary">
              {t("donor.dashboard.emptyNearby", "No nearby requests right now.")}
            </p>
          ) : null}

          <div className="space-y-2">
            {data?.nearby_requests.slice(0, 5).map((item) => (
              <div
                key={item.id}
                className="flex flex-col gap-2 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <p className="text-sm font-medium text-text-primary">
                    {item.hospital_name} - {item.blood_group}
                  </p>
                  <p className="text-xs text-text-secondary">
                    #{item.id} - {item.request_type} - {formatLocalDateTime(item.created_at)}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  leftIcon={<ArrowRight className="h-4 w-4" />}
                  onClick={() => navigate(`/blood-requests/${item.id}`)}
                >
                  {t("common.view", "View")}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-2">
          <h2 className="text-base font-semibold text-text-primary">
            {t("donor.dashboard.emergencyPreview", "Emergency Requests Preview")}
          </h2>
          <p className="text-sm text-text-secondary">
            {t(
              "donor.dashboard.emergencyHint",
              "Priority requests that need fast donor response"
            )}
          </p>

          <div className="space-y-2">
            {data?.emergency_requests.slice(0, 3).map((item) => (
              <div key={item.id} className="rounded-lg border border-error/25 bg-error-soft p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold text-error">
                    {item.hospital_name} - {item.blood_group}
                  </p>
                  <Button
                    variant="danger"
                    size="sm"
                    leftIcon={<UserCheck className="h-4 w-4" />}
                    onClick={() => navigate("/donor/donation-actions")}
                  >
                    {t("donor.dashboard.respond", "Respond")}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
