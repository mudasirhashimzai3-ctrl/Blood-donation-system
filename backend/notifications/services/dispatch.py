from notifications.models import Notification
from notifications.services.channels import publish_created, publish_unread_count, publish_updated
from notifications.services.email_service import send_email_notification
from notifications.services.in_app_service import deliver_in_app
from notifications.services.twilio_service import send_sms_notification


def _current_unread_count(user_id: int) -> int:
    return Notification.objects.filter(
        user_id=user_id,
        hidden_at__isnull=True,
        deleted_at__isnull=True,
        is_read=False,
    ).count()


def dispatch_notification(notification_id: int):
    try:
        notification = Notification.objects.select_related("user").get(
            pk=notification_id,
            deleted_at__isnull=True,
            hidden_at__isnull=True,
        )
    except Notification.DoesNotExist:
        return {"success": False, "error": "Notification not found"}

    notification.delivery_attempts += 1
    notification.save(update_fields=["delivery_attempts", "updated_at"])

    if notification.sent_via == "in_app":
        result = deliver_in_app(notification)
        publish_created(notification)
        publish_unread_count(notification.user_id, _current_unread_count(notification.user_id))
        return result

    if notification.sent_via == "email":
        result = send_email_notification(notification)
        publish_updated(notification)
        publish_unread_count(notification.user_id, _current_unread_count(notification.user_id))
        return result

    if notification.sent_via == "sms":
        result = send_sms_notification(notification)
        publish_updated(notification)
        publish_unread_count(notification.user_id, _current_unread_count(notification.user_id))
        return result

    notification.status = "failed"
    notification.error_message = "Unsupported channel."
    notification.save(update_fields=["status", "error_message", "updated_at"])
    publish_updated(notification)
    return {"success": False, "error": notification.error_message}
