from django.core.mail import send_mail
from django.utils import timezone


def send_email_notification(notification):
    user = notification.user
    if not user.email:
        notification.status = "failed"
        notification.error_message = "User email is not configured."
        notification.save(update_fields=["status", "error_message", "updated_at"])
        return {"success": False, "error": notification.error_message}

    try:
        send_mail(
            subject=notification.title,
            message=notification.message,
            from_email=None,
            recipient_list=[user.email],
            fail_silently=False,
        )
        notification.sent_at = timezone.now()
        notification.status = "delivered"
        notification.error_message = None
        notification.save(update_fields=["sent_at", "status", "error_message", "updated_at"])
        return {"success": True}
    except Exception as exc:  # pragma: no cover
        notification.status = "failed"
        notification.error_message = str(exc)
        notification.save(update_fields=["status", "error_message", "updated_at"])
        return {"success": False, "error": str(exc)}
