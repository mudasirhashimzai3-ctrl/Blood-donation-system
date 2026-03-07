from notifications.models import Notification
from notifications.services.dispatch import dispatch_notification
from notifications.services.retention import cleanup_old_notifications

try:
    from celery import shared_task
except ImportError:  # pragma: no cover
    def shared_task(*dargs, **dkwargs):
        def decorator(func):
            return func

        if dargs and callable(dargs[0]) and len(dargs) == 1 and not dkwargs:
            return dargs[0]
        return decorator


@shared_task(name="notifications.dispatch_notification")
def dispatch_notification_task(notification_id: int):
    return dispatch_notification(notification_id)


@shared_task(name="notifications.retry_failed_notifications")
def retry_failed_notifications(max_attempts: int = 3):
    failed = Notification.objects.filter(
        status="failed",
        hidden_at__isnull=True,
        deleted_at__isnull=True,
        delivery_attempts__lt=max_attempts,
    )
    retried = 0
    for row in failed:
        dispatch_notification(row.id)
        retried += 1
    return {"retried": retried}


@shared_task(name="notifications.cleanup_notifications_retention")
def cleanup_notifications_retention(days: int = 30):
    deleted = cleanup_old_notifications(days=days)
    return {"hidden": deleted}
