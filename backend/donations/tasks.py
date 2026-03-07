from django.utils import timezone

from donations.models import Donation
from donations.services.reminders import (
    expire_overdue_pending_donations,
    get_due_reminder_stage,
    send_donation_reminder,
)

try:
    from celery import shared_task
except ImportError:  # pragma: no cover
    def shared_task(*dargs, **dkwargs):
        def decorator(func):
            return func

        if dargs and callable(dargs[0]) and len(dargs) == 1 and not dkwargs:
            return dargs[0]
        return decorator


@shared_task(name="donations.process_due_reminders")
def process_due_reminders():
    now = timezone.now()
    expired_count = expire_overdue_pending_donations(now=now)

    queryset = Donation.objects.select_related("request", "donor").filter(
        status="pending",
        deleted_at__isnull=True,
        request__response_deadline__isnull=False,
        request__response_deadline__gt=now,
        reminder_count__lt=2,
    )

    sent = 0
    for donation in queryset:
        stage = get_due_reminder_stage(donation, now=now)
        if stage is None:
            continue
        send_donation_reminder(donation)
        sent += 1

    return {"expired": expired_count, "sent": sent}
