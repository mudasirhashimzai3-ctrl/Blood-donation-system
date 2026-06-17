import calendar
from datetime import date

from django.utils import timezone

ELIGIBILITY_GAP_MONTHS = 6


def add_calendar_months(value: date, months: int) -> date:
    month_index = value.month - 1 + months
    year = value.year + month_index // 12
    month = month_index % 12 + 1
    day = min(value.day, calendar.monthrange(year, month)[1])
    return date(year, month, day)


def get_donor_eligibility(last_donation_date, *, today=None) -> dict:
    today = today or timezone.localdate()

    if not last_donation_date:
        return {
            "is_eligible": True,
            "eligibility_status": "eligible",
            "eligible_from": None,
            "eligibility_reason": "No previous donation recorded.",
        }

    eligible_from = add_calendar_months(last_donation_date, ELIGIBILITY_GAP_MONTHS)
    is_eligible = today >= eligible_from

    return {
        "is_eligible": is_eligible,
        "eligibility_status": "eligible" if is_eligible else "not_eligible",
        "eligible_from": eligible_from,
        "eligibility_reason": (
            "At least six months have passed since the last donation."
            if is_eligible
            else "Less than six months have passed since the last donation."
        ),
    }


def get_donor_status_for_last_donation(last_donation_date, *, today=None) -> str:
    return "active" if get_donor_eligibility(last_donation_date, today=today)["is_eligible"] else "inactive"


def sync_donor_status(donor, *, today=None, save=True) -> str:
    expected_status = get_donor_status_for_last_donation(donor.last_donation_date, today=today)
    if donor.status != expected_status:
        donor.status = expected_status
        if save:
            donor.save(update_fields=["status", "updated_at"])
    return expected_status


def mark_donor_temporarily_inactive(donor, *, donation_date=None):
    donor.last_donation_date = donation_date or timezone.localdate()
    donor.status = "inactive"
    donor.save(update_fields=["last_donation_date", "status", "updated_at"])
    return donor


def refresh_donor_availability(*, queryset=None, today=None) -> int:
    from donors.models import Donor

    today = today or timezone.localdate()
    queryset = queryset or Donor.objects.filter(deleted_at__isnull=True)
    changed = 0
    for donor in queryset.only("id", "status", "last_donation_date", "updated_at"):
        previous_status = donor.status
        sync_donor_status(donor, today=today, save=False)
        if donor.status != previous_status:
            donor.save(update_fields=["status", "updated_at"])
            changed += 1
    return changed
