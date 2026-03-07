import logging
from datetime import timedelta

from django.core.mail import send_mail
from django.utils import timezone

from donations.models import Donation

logger = logging.getLogger(__name__)

REMINDER_CHANNELS = ("in_app", "email", "sms")


def normalize_reminder_channels(channels):
    if not channels:
        return list(REMINDER_CHANNELS)
    normalized = []
    for item in channels:
        value = str(item).strip().lower()
        if value in REMINDER_CHANNELS and value not in normalized:
            normalized.append(value)
    return normalized or list(REMINDER_CHANNELS)


def get_reminder_milestones(donation: Donation):
    notified_at = donation.notified_at or donation.created_at
    deadline = donation.request.response_deadline
    if not notified_at or not deadline or deadline <= notified_at:
        return []

    halfway = notified_at + ((deadline - notified_at) / 2)
    final = deadline - timedelta(minutes=15)

    milestones = [halfway]
    if final > halfway:
        milestones.append(final)
    return milestones


def get_due_reminder_stage(donation: Donation, now=None):
    now = now or timezone.now()
    milestones = get_reminder_milestones(donation)
    if donation.reminder_count >= len(milestones):
        return None

    target_time = milestones[donation.reminder_count]
    if now >= target_time:
        return donation.reminder_count + 1
    return None


def _build_reminder_message(donation: Donation):
    return (
        f"Blood request #{donation.request_id} needs response from donor "
        f"{donation.donor}. Status: {donation.status}."
    )


def _send_in_app_reminder(donation: Donation, message: str):
    logger.info("IN_APP reminder sent for donation=%s: %s", donation.id, message)


def _send_email_reminder(donation: Donation, message: str):
    if not donation.donor.email:
        logger.info("EMAIL reminder skipped donation=%s reason=no-email", donation.id)
        return

    send_mail(
        subject=f"Donation reminder for request #{donation.request_id}",
        message=message,
        from_email=None,
        recipient_list=[donation.donor.email],
        fail_silently=False,
    )


def _send_sms_mock(donation: Donation, message: str):
    logger.info(
        "SMS(MOCK) reminder for donation=%s phone=%s message=%s",
        donation.id,
        donation.donor.phone,
        message,
    )


def send_donation_reminder(donation: Donation, channels=None):
    selected_channels = normalize_reminder_channels(channels)
    message = _build_reminder_message(donation)
    sent_channels = []
    failed_channels = []

    for channel in selected_channels:
        try:
            if channel == "in_app":
                _send_in_app_reminder(donation, message)
            elif channel == "email":
                _send_email_reminder(donation, message)
            elif channel == "sms":
                _send_sms_mock(donation, message)
            sent_channels.append(channel)
        except Exception as exc:
            logger.exception("Reminder channel failed donation=%s channel=%s", donation.id, channel)
            failed_channels.append({"channel": channel, "error": str(exc)})

    now = timezone.now()
    donation.reminder_sent_at = now
    donation.reminder_count = donation.reminder_count + 1
    donation.save(update_fields=["reminder_sent_at", "reminder_count", "updated_at"])

    return {
        "donation_id": donation.id,
        "sent_channels": sent_channels,
        "failed_channels": failed_channels,
        "reminder_count": donation.reminder_count,
    }


def expire_overdue_pending_donations(now=None):
    now = now or timezone.now()
    pending = Donation.objects.select_related("request").filter(
        status="pending",
        deleted_at__isnull=True,
        request__response_deadline__isnull=False,
        request__response_deadline__lt=now,
    )
    expired_count = 0
    for donation in pending:
        donation.status = "expired"
        donation.responded_at = now
        if donation.notified_at:
            delta = now - donation.notified_at
            donation.response_time = max(0, int(delta.total_seconds() // 60))
        donation.save(update_fields=["status", "responded_at", "response_time", "updated_at"])
        expired_count += 1
    return expired_count
