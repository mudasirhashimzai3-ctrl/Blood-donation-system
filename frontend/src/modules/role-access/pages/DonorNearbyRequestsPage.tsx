import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { PageHeader } from "@/components";
import { Button, Card, CardContent } from "@/components/ui";
import { formatLocalDateTime } from "@/utils/formatLocalDateTime";
import { useDonorDashboard } from "../queries/useRoleAccessQueries";

export default function DonorNearbyRequestsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data, isLoading, error } = useDonorDashboard();

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("donor.nearby.title", "Nearby Requests")}
        subtitle={t("donor.nearby.subtitle", "Requests matched near your location")}
      />

      <Card>
        <CardContent className="space-y-3">
          {isLoading ? <p>{t("common.loading", "Loading...")}</p> : null}
          {error ? (
            <p className="text-sm text-error">{t("donor.nearby.error", "Failed to load nearby requests")}</p>
          ) : null}

          {!isLoading && !error && (data?.nearby_requests.length ?? 0) === 0 ? (
            <p className="text-sm text-text-secondary">{t("donor.nearby.empty", "No nearby requests found")}</p>
          ) : null}

          {data?.nearby_requests.map((item) => (
            <div
              key={item.id}
              className="flex flex-col gap-2 rounded-lg border border-border p-3 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="text-sm font-medium text-text-primary">
                  #{item.id} - {item.hospital_name}
                </p>
                <p className="text-xs text-text-secondary">
                  {item.blood_group} - {item.request_type} - {formatLocalDateTime(item.created_at)}
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
        </CardContent>
      </Card>
    </div>
  );
}
