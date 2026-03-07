import { ArrowLeft, Eye, EyeOff, Trash2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

import { PageHeader } from "@/components";
import useCan from "@/hooks/useCan";
import { formatLocalDateTime } from "@/utils/formatLocalDateTime";
import { Button, Card, CardContent } from "@components/ui";
import NotificationStatusBadge from "../components/NotificationStatusBadge";
import NotificationTypeBadge from "../components/NotificationTypeBadge";
import { useDeleteNotification, useNotification, useSetNotificationRead } from "../queries/useNotificationQueries";

export default function NotificationViewPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { can } = useCan();
  const { id } = useParams<{ id: string }>();
  const notificationId = Number(id);

  const { data: notification, isLoading, error } = useNotification(notificationId, {
    enabled: Number.isFinite(notificationId),
  });
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

  if (!Number.isFinite(notificationId)) {
    return (
      <Card>
        <CardContent className="text-sm text-error">
          {t("notifications.errors.notFound", "Notification not found")}
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent>{t("notifications.loading", "Loading notification details...")}</CardContent>
      </Card>
    );
  }

  if (error || !notification) {
    return (
      <Card>
        <CardContent className="text-sm text-error">
          {t("notifications.errors.loadFailed", "Failed to load notification details")}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("notifications.view.title", "Notification Details")}
        subtitle={t("notifications.view.subtitle", "Inspect delivery status and context payload")}
      />

      <Card>
        <CardContent className="space-y-5">
          <div className="flex flex-col gap-3 border-b border-border pb-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-text-primary">{notification.title}</h2>
              <p className="text-sm text-text-secondary">
                {notification.sent_via} - {formatLocalDateTime(notification.created_at)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <NotificationTypeBadge type={notification.type} />
              <NotificationStatusBadge status={notification.status} />
            </div>
          </div>

          <div className="rounded-lg border border-border bg-surface p-4 text-sm text-text-primary">
            {notification.message}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <p className="text-xs uppercase text-text-secondary">
                {t("notifications.fields.readStatus", "Read Status")}
              </p>
              <p className="text-sm text-text-primary">
                {notification.is_read ? "Read" : "Unread"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase text-text-secondary">{t("notifications.fields.priority", "Priority")}</p>
              <p className="text-sm text-text-primary">{notification.priority}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-text-secondary">{t("notifications.fields.sentAt", "Sent At")}</p>
              <p className="text-sm text-text-primary">
                {notification.sent_at ? formatLocalDateTime(notification.sent_at) : "-"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase text-text-secondary">{t("notifications.fields.readAt", "Read At")}</p>
              <p className="text-sm text-text-primary">
                {notification.read_at ? formatLocalDateTime(notification.read_at) : "-"}
              </p>
            </div>
          </div>

          {Object.keys(notification.metadata || {}).length > 0 ? (
            <div>
              <p className="mb-2 text-xs uppercase text-text-secondary">
                {t("notifications.fields.metadata", "Metadata")}
              </p>
              <pre className="overflow-x-auto rounded-lg border border-border bg-surface p-3 text-xs text-text-primary">
                {JSON.stringify(notification.metadata, null, 2)}
              </pre>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center justify-end gap-2 border-t border-border pt-4">
            <Button
              variant="outline"
              leftIcon={<ArrowLeft className="h-4 w-4" />}
              onClick={() => navigate("/notifications")}
            >
              {t("notifications.actions.backToList", "Back to list")}
            </Button>
            <Button
              variant="outline"
              leftIcon={notification.is_read ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              loading={setReadMutation.isPending}
              onClick={async () => {
                await setReadMutation.mutateAsync({
                  id: notification.id,
                  isRead: !notification.is_read,
                });
              }}
            >
              {notification.is_read
                ? t("notifications.actions.markUnread", "Mark unread")
                : t("notifications.actions.markRead", "Mark read")}
            </Button>
            <Button
              variant="danger"
              leftIcon={<Trash2 className="h-4 w-4" />}
              loading={deleteMutation.isPending}
              onClick={async () => {
                await deleteMutation.mutateAsync(notification.id);
                navigate("/notifications");
              }}
            >
              {t("notifications.actions.delete", "Remove")}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
