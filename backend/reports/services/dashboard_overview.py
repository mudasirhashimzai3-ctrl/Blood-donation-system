from django.db.models import Count, Q
from django.utils import timezone

from blood_requests.models import BloodRequest
from donations.models import Donation
from donors.models import Donor
from recipients.models import Recipient

from .common import GROUP_BY_TRUNC, apply_donation_filters, apply_request_filters, pct, safe_avg


def _rate_or_none(part: int, whole: int):
    if whole == 0:
        return None
    return pct(part, whole)


def build_dashboard_overview(filters: dict):
    request_queryset = BloodRequest.objects.select_related("hospital", "recipient")
    request_queryset = apply_request_filters(request_queryset, filters)

    donation_queryset = Donation.objects.select_related("request", "request__hospital", "donor")
    donation_queryset = apply_donation_filters(donation_queryset, filters)

    total_donors = Donor.objects.count()
    total_recipients = Recipient.objects.count()
    active_requests = BloodRequest.objects.filter(
        status__in=["pending", "matched"],
        is_active=True,
    ).count()
    completed_donations = Donation.objects.filter(status="completed").count()

    request_status_counts_map = {
        item["status"]: item["count"]
        for item in request_queryset.values("status").annotate(count=Count("id"))
    }
    requests_status_distribution = [
        {
            "status": status_value,
            "count": request_status_counts_map.get(status_value, 0),
            "href": f"/blood-requests?status={status_value}",
        }
        for status_value, _ in BloodRequest.STATUS_CHOICES
    ]

    trunc_func = GROUP_BY_TRUNC[filters["group_by"]]
    donation_trend_rows = (
        donation_queryset.annotate(bucket=trunc_func("created_at"))
        .values("bucket")
        .annotate(
            completed=Count("id", filter=Q(status="completed")),
            cancelled=Count("id", filter=Q(status="cancelled")),
        )
        .order_by("bucket")
    )
    donations_trend = [
        {
            "bucket": item["bucket"].isoformat() if item["bucket"] else None,
            "completed": item["completed"],
            "cancelled": item["cancelled"],
        }
        for item in donation_trend_rows
    ]

    donor_by_group = {
        item["blood_group"]: item["count"]
        for item in Donor.objects.values("blood_group").annotate(count=Count("id"))
    }
    active_request_by_group = {
        item["blood_group"]: item["count"]
        for item in BloodRequest.objects.filter(
            status__in=["pending", "matched"],
            is_active=True,
        )
        .values("blood_group")
        .annotate(count=Count("id"))
    }
    blood_group_supply_vs_demand = [
        {
            "blood_group": blood_group,
            "donors": donor_by_group.get(blood_group, 0),
            "active_requests": active_request_by_group.get(blood_group, 0),
        }
        for blood_group, _ in BloodRequest.BLOOD_GROUP_CHOICES
    ]

    request_total = request_queryset.count()
    request_completed = request_queryset.filter(status="completed").count()
    donation_total = donation_queryset.count()
    donation_completed = donation_queryset.filter(status="completed").count()
    donation_response_times = donation_queryset.values_list("response_time", flat=True)

    return {
        "generated_at": timezone.now().isoformat(),
        "filters": {
            "date_from": filters["date_from"].isoformat(),
            "date_to": filters["date_to"].isoformat(),
            "group_by": filters["group_by"],
        },
        "kpis": {
            "total_donors": {"value": total_donors, "href": "/donors"},
            "total_recipients": {"value": total_recipients, "href": "/recipients"},
            "active_requests": {"value": active_requests, "href": "/blood-requests"},
            "completed_donations": {"value": completed_donations, "href": "/donations"},
        },
        "charts": {
            "requests_status_distribution": requests_status_distribution,
            "donations_trend": donations_trend,
            "blood_group_supply_vs_demand": blood_group_supply_vs_demand,
        },
        "statistics": {
            "request_completion_rate": _rate_or_none(request_completed, request_total),
            "donation_completion_rate": _rate_or_none(donation_completed, donation_total),
            "avg_donation_response_time_minutes": safe_avg(donation_response_times),
        },
    }
