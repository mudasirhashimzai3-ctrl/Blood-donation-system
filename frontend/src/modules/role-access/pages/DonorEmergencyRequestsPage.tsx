import { ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { PageHeader } from "@/components";
import { Button, Card, CardContent } from "@/components/ui";
import { formatLocalDateTime } from "@/utils/formatLocalDateTime";
import { useDonorDashboard } from "../queries/useRoleAccessQueries";

export default function DonorEmergencyRequestsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { data, isLoading, error } = useDonorDashboard();

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("donor.emergency.title", "Emergency Requests")}
        subtitle={t("donor.emergency.subtitle", "High-priority blood requests")}
      />

      <Card>
        <CardContent className="space-y-3">
          {isLoading ? <p>{t("common.loading", "Loading...")}</p> : null}
          {error ? (
            <p className="text-sm text-error">{t("donor.emergency.error", "Failed to load emergency requests")}</p>
          ) : null}

          {!isLoading && !error && (data?.emergency_requests.length ?? 0) === 0 ? (
            <p className="text-sm text-text-secondary">{t("donor.emergency.empty", "No emergency requests found")}</p>
          ) : null}

          {data?.emergency_requests.map((item) => (
            <div key={item.id} className="rounded-lg border border-error/30 bg-error-soft p-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-error">
                    #{item.id} - {item.hospital_name}
                  </p>
                  <p className="text-xs text-text-secondary">
                    {item.blood_group} - {item.request_type} - {formatLocalDateTime(item.created_at)}
                  </p>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  leftIcon={<ArrowRight className="h-4 w-4" />}
                  onClick={() => navigate(`/blood-requests/${item.id}`)}
                >
                  {t("donor.emergency.respond", "Respond Now")}
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
