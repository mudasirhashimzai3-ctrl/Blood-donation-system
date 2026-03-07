from django.db.models import Count
from django.utils import timezone

from blood_requests.models import BloodRequest

from .common import apply_request_filters, build_created_at_trend, duration_minutes, pct, safe_avg


def build_request_analytics(filters: dict):
    queryset = BloodRequest.objects.select_related("hospital", "recipient")
    queryset = apply_request_filters(queryset, filters)

    total = queryset.count()
    status_counts = {item["status"]: item["count"] for item in queryset.values("status").annotate(count=Count("id"))}
    completed_count = status_counts.get("completed", 0)

    matched_minutes = [
        duration_minutes(created_at, matched_at)
        for created_at, matched_at in queryset.values_list("created_at", "matched_at")
        if matched_at is not None
    ]
    completed_minutes = [
        duration_minutes(created_at, completed_at)
        for created_at, completed_at in queryset.values_list("created_at", "completed_at")
        if completed_at is not None
    ]

    now = timezone.now()
    overdue_pending_count = queryset.filter(status="pending", response_deadline__lt=now).count()

    trends = build_created_at_trend(queryset, filters["group_by"])

    breakdowns = {
        "blood_group": list(
            queryset.values("blood_group").annotate(count=Count("id")).order_by("blood_group")
        ),
        "request_type": list(
            queryset.values("request_type").annotate(count=Count("id")).order_by("request_type")
        ),
        "priority": list(
            queryset.values("priority").annotate(count=Count("id")).order_by("priority")
        ),
    }

    return {
        "summary": {
            "total_requests": total,
            "status_counts": status_counts,
            "completion_rate": pct(completed_count, total),
            "avg_match_time_minutes": safe_avg(matched_minutes),
            "avg_completion_time_minutes": safe_avg(completed_minutes),
            "overdue_pending_count": overdue_pending_count,
        },
        "trends": trends,
        "breakdowns": breakdowns,
        "meta": {
            "group_by": filters["group_by"],
            "date_from": filters["date_from"].isoformat(),
            "date_to": filters["date_to"].isoformat(),
            "record_count": total,
        },
    }
