import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { PageHeader } from "@/components";
import useCan from "@/hooks/useCan";
import { Card, CardContent } from "@components/ui";
import NotificationFilters from "../components/NotificationFilters";
import NotificationTable from "../components/NotificationTable";
import { useNotificationFilters } from "../hooks/useNotificationFilters";
import {
  useDeleteNotification,
  useNotificationsList,
  useSetNotificationRead,
} from "../queries/useNotificationQueries";

export default function NotificationListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { can } = useCan();
  const {
    search,
    status,
    type,
    sentVia,
    priority,
    page,
    pageSize,
    setSearch,
    setStatus,
    setType,
    setSentVia,
    setPriority,
    setPage,
    resetFilters,
    queryParams,
  } = useNotificationFilters();

  const { data, isLoading, error } = useNotificationsList(queryParams);
  const setReadMutation = useSetNotificationRead();
  const deleteMutation = useDeleteNotification();

  if (!can("notifications")) {
    return (
      <Card>
        <CardContent className="text-sm text-error">
          {t("notifications.errors.noPermission", "You do not have permission to access notifications.")}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("notifications.title", "Notifications")}
        subtitle={t("notifications.subtitle", "Track in-app, email and SMS notification delivery")}
      />

      <Card>
        <CardContent>
          <NotificationFilters
            search={search}
            status={status}
            type={type}
            sentVia={sentVia}
            priority={priority}
            onSearchChange={setSearch}
            onStatusChange={setStatus}
            onTypeChange={setType}
            onSentViaChange={setSentVia}
            onPriorityChange={setPriority}
            onReset={resetFilters}
          />
        </CardContent>
      </Card>

      {error ? (
        <Card>
          <CardContent className="text-sm text-error">
            {t("notifications.errors.loadFailed", "Failed to load notifications")}
          </CardContent>
        </Card>
      ) : (
        <NotificationTable
          notifications={data?.results ?? []}
          isLoading={isLoading}
          totalCount={data?.count ?? 0}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onView={(id) => navigate(`/notifications/${id}`)}
          onToggleRead={async (id, isRead) => {
            await setReadMutation.mutateAsync({ id, isRead });
          }}
          onDelete={async (id) => {
            await deleteMutation.mutateAsync(id);
          }}
        />
      )}
    </div>
  );
}
