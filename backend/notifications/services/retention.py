from datetime import timedelta

from django.db.models import Q
from django.utils import timezone

from notifications.models import Notification


def cleanup_old_notifications(days: int = 30):
    now = timezone.now()
    cutoff = now - timedelta(days=days)

    queryset = Notification.objects.filter(
        hidden_at__isnull=True,
        deleted_at__isnull=True,
    ).filter(
        Q(created_at__lt=cutoff)
        | Q(expires_at__isnull=False, expires_at__lt=now)
    )

    count = queryset.update(hidden_at=now, updated_at=now)
    return count
