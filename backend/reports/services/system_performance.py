from django.db.models import Count, Q
from django.db.models.functions import TruncDay
from django.utils import timezone

from blood_requests.models import BloodRequest
from donations.models import Donation
from donors.models import Donor
from hospitals.models import Hospital
from notifications.models import Notification

from .common import pct


def build_system_performance(filters: dict):
    date_from = filters["date_from"]
    date_to = filters["date_to"]

    notifications_qs = Notification.objects.filter(created_at__gte=date_from, created_at__lte=date_to)
    requests_qs = BloodRequest.objects.filter(created_at__gte=date_from, created_at__lte=date_to)
    donations_qs = Donation.objects.filter(created_at__gte=date_from, created_at__lte=date_to)

    if filters.get("hospital_id"):
        requests_qs = requests_qs.filter(hospital_id=filters["hospital_id"])
        donations_qs = donations_qs.filter(request__hospital_id=filters["hospital_id"])
        notifications_qs = notifications_qs.filter(request__hospital_id=filters["hospital_id"])

    if filters.get("city"):
        requests_qs = requests_qs.filter(hospital__city__icontains=filters["city"])
        donations_qs = donations_qs.filter(request__hospital__city__icontains=filters["city"])
        notifications_qs = notifications_qs.filter(request__hospital__city__icontains=filters["city"])

    if filters.get("emergency_only"):
        requests_qs = requests_qs.filter(Q(is_emergency=True) | Q(request_type__in=["urgent", "critical"]))
        donations_qs = donations_qs.filter(request__in=requests_qs)
        notifications_qs = notifications_qs.filter(request__in=requests_qs)

    requests_qs = requests_qs.distinct()
    donations_qs = donations_qs.distinct()
    notifications_qs = notifications_qs.distinct()

    total_notifications = notifications_qs.count()
    delivered_count = notifications_qs.filter(status="delivered").count()
    failed_count = notifications_qs.filter(status="failed").count()
    queued_count = notifications_qs.filter(status="queued").count()

    reminder_donations = donations_qs.filter(reminder_count__gt=0)
    pending_backlog = donations_qs.filter(status="pending", request__response_deadline__gt=timezone.now()).count()

    failed_events = list(
        notifications_qs.filter(status="failed")
        .values("event_key")
        .annotate(count=Count("id"))
        .order_by("-count", "event_key")
    )

    notification_trend = list(
        notifications_qs.annotate(bucket=TruncDay("created_at"))
        .values("bucket", "status")
        .annotate(count=Count("id"))
        .order_by("bucket", "status")
    )

    backlog_trend = list(
        donations_qs.filter(status="pending")
        .annotate(bucket=TruncDay("created_at"))
        .values("bucket")
        .annotate(count=Count("id"))
        .order_by("bucket")
    )

    donors_missing_geo = Donor.objects.filter(latitude__isnull=True).count() + Donor.objects.filter(
        longitude__isnull=True
    ).exclude(latitude__isnull=True).count()
    hospitals_missing_geo = Hospital.objects.filter(latitude__isnull=True).count() + Hospital.objects.filter(
        longitude__isnull=True
    ).exclude(latitude__isnull=True).count()

    return {
        "summary": {
            "total_notifications": total_notifications,
            "delivered_rate": pct(delivered_count, total_notifications),
            "failed_rate": pct(failed_count, total_notifications),
            "queued_notifications": queued_count,
            "retryable_failed_notifications": notifications_qs.filter(status="failed", delivery_attempts__lt=3).count(),
            "reminder_activity_count": reminder_donations.count(),
            "pending_response_backlog": pending_backlog,
            "auto_match_enabled_rate": pct(requests_qs.filter(auto_match_enabled=True).count(), requests_qs.count()),
        },
        "data_quality": {
            "donors_missing_coordinates": donors_missing_geo,
            "hospitals_missing_coordinates": hospitals_missing_geo,
            "requests_missing_response_deadline": requests_qs.filter(response_deadline__isnull=True).count(),
        },
        "failed_events": failed_events,
        "notification_trend": [
            {
                "bucket": row["bucket"].isoformat() if row["bucket"] else None,
                "status": row["status"],
                "count": row["count"],
            }
            for row in notification_trend
        ],
        "pending_backlog_trend": [
            {
                "bucket": row["bucket"].isoformat() if row["bucket"] else None,
                "count": row["count"],
            }
            for row in backlog_trend
        ],
        "meta": {
            "date_from": filters["date_from"].isoformat(),
            "date_to": filters["date_to"].isoformat(),
            "record_count": total_notifications,
        },
    }
