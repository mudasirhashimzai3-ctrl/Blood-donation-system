from django.utils import timezone


def deliver_in_app(notification):
    notification.sent_at = notification.sent_at or timezone.now()
    notification.status = "delivered"
    notification.error_message = None
    notification.save(update_fields=["sent_at", "status", "error_message", "updated_at"])
    return {"success": True}
