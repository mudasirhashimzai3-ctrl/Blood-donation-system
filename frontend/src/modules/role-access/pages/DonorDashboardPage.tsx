import { Bell, Clock3 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { DashboardCard, PageHeader } from "@/components";
import { Button, Card, CardContent } from "@/components/ui";
import { useDonorDashboard } from "../queries/useRoleAccessQueries";

export default function DonorDashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data } = useDonorDashboard();

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("donor.dashboard.title", "Donor Dashboard")}
        subtitle={t(
          "donor.dashboard.subtitle",
          "Respond to donations and review your history"
        )}
      />

      <div className="grid gap-4 md:grid-cols-1">
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
            <Button variant="outline" onClick={() => navigate("/donor/donation-actions")}>
              {t("donor.dashboard.openActions", "Accept / Reject Donation")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
