import { MessageSquareText } from "lucide-react";
import { useTranslation } from "react-i18next";

import { PageHeader } from "@/components";
import { Card, CardContent } from "@/components/ui";
import { formatLocalDateTime } from "@/utils/formatLocalDateTime";
import { useRecipientDonorResponses } from "../queries/useRoleAccessQueries";

export default function RecipientDonorResponsesPage() {
  const { t } = useTranslation();
  const { data, isLoading, error } = useRecipientDonorResponses();

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("recipient.responses.title", "Donor Responses")}
        subtitle={t(
          "recipient.responses.subtitle",
          "Track who accepted or rejected each blood request"
        )}
      />

      <Card>
        <CardContent className="space-y-4">
          {isLoading ? <p>{t("common.loading", "Loading...")}</p> : null}
          {error ? (
            <p className="text-sm text-error">
              {t("recipient.responses.error", "Failed to load donor responses")}
            </p>
          ) : null}

          {!isLoading && !error && (data?.length ?? 0) === 0 ? (
            <p className="text-sm text-text-secondary">
              {t("recipient.responses.empty", "No donor responses available yet")}
            </p>
          ) : null}

          <div className="space-y-3">
            {data?.map((group) => (
              <div key={group.request.id} className="rounded-lg border border-border p-3">
                <div className="mb-2 flex items-center gap-2">
                  <MessageSquareText className="h-4 w-4 text-primary" />
                  <p className="text-sm font-semibold text-text-primary">
                    #{group.request.id} - {group.request.hospital_name} - {group.request.blood_group}
                  </p>
                </div>

                {group.responses.length === 0 ? (
                  <p className="text-xs text-text-secondary">
                    {t("recipient.responses.noEntries", "No responses yet")}
                  </p>
                ) : (
                  <div className="space-y-2">
                    {group.responses.map((row) => (
                      <div
                        key={row.notification_id}
                        className="flex flex-col gap-1 rounded-md border border-border bg-surface p-2 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <p className="text-sm font-medium text-text-primary">
                            {row.donor_name} - {row.response_status}
                          </p>
                          <p className="text-xs text-text-secondary">
                            {row.donor_phone} - {row.channel} - {row.delivery_status}
                          </p>
                        </div>
                        <p className="text-xs text-text-secondary">
                          {row.responded_at ? formatLocalDateTime(row.responded_at) : "-"}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
