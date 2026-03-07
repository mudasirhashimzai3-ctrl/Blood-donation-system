import os

from django.utils import timezone
from twilio.rest import Client


def send_sms_notification(notification):
    account_sid = os.getenv("TWILIO_ACCOUNT_SID")
    auth_token = os.getenv("TWILIO_AUTH_TOKEN")
    from_number = os.getenv("TWILIO_FROM_NUMBER")
    callback_url = os.getenv("TWILIO_STATUS_CALLBACK_URL")

    phone = notification.user.phone
    if not phone:
        notification.status = "failed"
        notification.error_message = "User phone is not configured."
        notification.save(update_fields=["status", "error_message", "updated_at"])
        return {"success": False, "error": notification.error_message}

    if not account_sid or not auth_token or not from_number:
        notification.status = "failed"
        notification.error_message = "Twilio credentials are missing."
        notification.save(update_fields=["status", "error_message", "updated_at"])
        return {"success": False, "error": notification.error_message}

    try:
        client = Client(account_sid, auth_token)
        result = client.messages.create(
            to=phone,
            from_=from_number,
            body=notification.message,
            status_callback=callback_url or None,
        )
        notification.sent_at = timezone.now()
        notification.status = "sent"
        notification.provider_message_id = result.sid
        notification.provider_status = result.status
        notification.provider_response = {"sid": result.sid, "status": result.status}
        notification.error_message = None
        notification.save(
            update_fields=[
                "sent_at",
                "status",
                "provider_message_id",
                "provider_status",
                "provider_response",
                "error_message",
                "updated_at",
            ]
        )
        return {"success": True, "sid": result.sid, "status": result.status}
    except Exception as exc:  # pragma: no cover
        notification.status = "failed"
        notification.error_message = str(exc)
        notification.save(update_fields=["status", "error_message", "updated_at"])
        return {"success": False, "error": str(exc)}
