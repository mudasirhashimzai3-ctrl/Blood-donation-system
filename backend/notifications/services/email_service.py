from django.conf import settings as django_settings
from django.core.mail import get_connection, send_mail
from django.utils import timezone

from core.services.settings_service import get_runtime_notification_settings


def send_email_notification(notification):
    user = notification.user
    if not user.email:
        notification.status = "failed"
        notification.error_message = "User email is not configured."
        notification.save(update_fields=["status", "error_message", "updated_at"])
        return {"success": False, "error": notification.error_message}

    config = get_runtime_notification_settings()
    if not config.get("email_enabled", True):
        notification.status = "failed"
        notification.error_message = "Email notifications are disabled."
        notification.save(update_fields=["status", "error_message", "updated_at"])
        return {"success": False, "error": notification.error_message}

    try:
        connection = get_connection(
            host=config.get("smtp_host") or django_settings.EMAIL_HOST,
            port=int(config.get("smtp_port") or django_settings.EMAIL_PORT),
            username=config.get("smtp_username") or django_settings.EMAIL_HOST_USER,
            password=config.get("smtp_password") or django_settings.EMAIL_HOST_PASSWORD,
            use_tls=getattr(django_settings, "EMAIL_USE_TLS", True),
            use_ssl=getattr(django_settings, "EMAIL_USE_SSL", False),
            fail_silently=False,
        )
        send_mail(
            subject=notification.title,
            message=notification.message,
            from_email=config.get("from_email") or django_settings.DEFAULT_FROM_EMAIL,
            recipient_list=[user.email],
            fail_silently=False,
            connection=connection,
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
