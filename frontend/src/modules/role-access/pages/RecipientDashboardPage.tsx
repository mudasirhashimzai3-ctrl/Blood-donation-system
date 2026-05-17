import { Bell, ClipboardList, PlusCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { DashboardCard, PageHeader } from "@/components";
import { Button, Card, CardContent } from "@/components/ui";
import { getBloodRequestsRouteByRole } from "@/modules/auth/utils/roleRouting";
import { formatLocalDateTime } from "@/utils/formatLocalDateTime";
import { useRecipientDashboard } from "../queries/useRoleAccessQueries";

export default function RecipientDashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data, isLoading, error } = useRecipientDashboard();

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("recipient.dashboard.title", "Recipient Dashboard")}
        subtitle={t(
          "recipient.dashboard.subtitle",
          "Create requests and track donor responses"
        )}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <DashboardCard
          title={t("recipient.dashboard.active", "My Requests")}
          value={data?.active_requests.length ?? 0}
          icon={ClipboardList}
          color="primary"
        />
        <DashboardCard
          title={t("recipient.dashboard.unread", "Unread Notifications")}
          value={data?.unread_notifications ?? 0}
          icon={Bell}
          color="warning"
        />
      </div>

      <Card>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button leftIcon={<PlusCircle className="h-4 w-4" />} onClick={() => navigate("/recipient/create-request")}>
              {t("recipient.dashboard.createRequest", "Create Blood Request")}
            </Button>
            <Button variant="outline" onClick={() => navigate("/recipient/donor-responses")}>
              {t("recipient.dashboard.responses", "Donor Responses")}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3">
          <h2 className="text-base font-semibold text-text-primary">
            {t("recipient.dashboard.requestsPreview", "Recent Requests")}
          </h2>

          {isLoading ? <p>{t("common.loading", "Loading...")}</p> : null}
          {error ? (
            <p className="text-sm text-error">
              {t("recipient.dashboard.error", "Failed to load recipient dashboard")}
            </p>
          ) : null}

          {!isLoading && !error && (data?.active_requests.length ?? 0) === 0 ? (
            <p className="text-sm text-text-secondary">{t("recipient.dashboard.empty", "No requests found")}</p>
          ) : null}

          {data?.active_requests.slice(0, 5).map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-2 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-medium text-text-primary">
                  #{item.id} - {item.hospital_name} - {item.blood_group}
                </p>
                <p className="text-xs text-text-secondary">
                  {item.request_type} - {item.status} - {formatLocalDateTime(item.created_at)}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`${getBloodRequestsRouteByRole("recipient")}/${item.id}`)}
              >
                {t("common.view", "View")}
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
