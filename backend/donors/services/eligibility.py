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
