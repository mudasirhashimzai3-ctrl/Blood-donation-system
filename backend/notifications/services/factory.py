from django.contrib.auth import get_user_model
from django.db import IntegrityError

from notifications.models import Notification

User = get_user_model()

try:
    from notifications.tasks import dispatch_notification_task
except Exception:  # pragma: no cover
    dispatch_notification_task = None


def _dispatch_async(notification_id: int):
    if dispatch_notification_task is None:
        return None

    if hasattr(dispatch_notification_task, "delay"):
        return dispatch_notification_task.delay(notification_id)

    return dispatch_notification_task(notification_id)


def _resolve_users(*, user_ids=None, role_names=None):
    queryset = User.objects.filter(is_active=True, deleted_at__isnull=True)

    resolved_ids = set()
    if user_ids:
        resolved_ids.update(int(item) for item in user_ids)

    if role_names:
        role_users = queryset.filter(role_name__in=role_names).values_list("id", flat=True)
        resolved_ids.update(role_users)

    if not resolved_ids:
        return []

    return list(queryset.filter(id__in=resolved_ids))


def create_notifications(
    *,
    event_key: str,
    type: str,
    title: str,
    message: str,
    sent_via: list[str],
    user_ids=None,
    role_names=None,
    request_id=None,
    donation_id=None,
    metadata=None,
    priority: str = "normal",
    dedupe_key: str | None = None,
):
    targets = _resolve_users(user_ids=user_ids, role_names=role_names)
    if not targets:
        return []

    channels = []
    for channel in sent_via or []:
        value = str(channel).strip().lower()
        if value in {"in_app", "email", "sms"} and value not in channels:
            channels.append(value)

    if not channels:
        channels = ["in_app"]

    created_rows = []
    for user in targets:
        for channel in channels:
            payload = {
                "user": user,
                "user_type": user.role_name or "user",
                "request_id": request_id,
                "donation_id": donation_id,
                "event_key": event_key,
                "type": type,
                "title": title,
                "message": message,
                "sent_via": channel,
                "status": "queued",
                "priority": priority,
                "metadata": metadata or {},
                "dedupe_key": dedupe_key,
            }
            try:
                if dedupe_key:
                    notification, created = Notification.objects.get_or_create(
                        user=user,
                        sent_via=channel,
                        dedupe_key=dedupe_key,
                        hidden_at__isnull=True,
                        deleted_at__isnull=True,
                        defaults=payload,
                    )
                    if not created:
                        continue
                else:
                    notification = Notification.objects.create(**payload)
            except IntegrityError:
                continue

            created_rows.append(notification)
            _dispatch_async(notification.id)

    return created_rows
