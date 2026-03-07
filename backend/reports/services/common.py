import json
from datetime import datetime
from decimal import Decimal
from statistics import median

from django.db.models import Count
from django.db.models import Q
from django.db.models.functions import TruncDay, TruncMonth, TruncWeek

GROUP_BY_TRUNC = {
    "day": TruncDay,
    "week": TruncWeek,
    "month": TruncMonth,
}


def as_float(value, default=0.0):
    if value is None:
        return default
    if isinstance(value, Decimal):
        return float(value)
    return float(value)


def pct(part, whole):
    if not whole:
        return 0.0
    return round((part / whole) * 100.0, 2)


def safe_avg(values):
    cleaned = [float(v) for v in values if v is not None]
    if not cleaned:
        return None
    return round(sum(cleaned) / len(cleaned), 2)


def safe_median(values):
    cleaned = sorted(float(v) for v in values if v is not None)
    if not cleaned:
        return None
    return round(float(median(cleaned)), 2)


def duration_minutes(start: datetime | None, end: datetime | None):
    if not start or not end:
        return None
    delta = end - start
    return max(0, int(delta.total_seconds() // 60))


def apply_request_filters(queryset, filters):
    date_from = filters["date_from"]
    date_to = filters["date_to"]
    queryset = queryset.filter(created_at__gte=date_from, created_at__lte=date_to)

    if filters.get("hospital_id"):
        queryset = queryset.filter(hospital_id=filters["hospital_id"])
    if filters.get("city"):
        queryset = queryset.filter(hospital__city__icontains=filters["city"])
    if filters.get("blood_group"):
        queryset = queryset.filter(blood_group=filters["blood_group"])
    if filters.get("request_type"):
        queryset = queryset.filter(request_type=filters["request_type"])
    if filters.get("priority"):
        queryset = queryset.filter(priority=filters["priority"])
    if filters.get("status"):
        queryset = queryset.filter(status=filters["status"])

    if filters.get("emergency_only"):
        queryset = queryset.filter(Q(is_emergency=True) | Q(request_type__in=["urgent", "critical"]))

    return queryset.distinct()


def apply_donation_filters(queryset, filters):
    date_from = filters["date_from"]
    date_to = filters["date_to"]

    queryset = queryset.filter(created_at__gte=date_from, created_at__lte=date_to)

    if filters.get("hospital_id"):
        queryset = queryset.filter(request__hospital_id=filters["hospital_id"])
    if filters.get("city"):
        queryset = queryset.filter(request__hospital__city__icontains=filters["city"])
    if filters.get("blood_group"):
        queryset = queryset.filter(request__blood_group=filters["blood_group"])
    if filters.get("request_type"):
        queryset = queryset.filter(request__request_type=filters["request_type"])
    if filters.get("priority"):
        queryset = queryset.filter(request__priority=filters["priority"])
    if filters.get("status"):
        queryset = queryset.filter(status=filters["status"])

    if filters.get("emergency_only"):
        queryset = queryset.filter(
            Q(request__is_emergency=True) | Q(request__request_type__in=["urgent", "critical"])
        )

    return queryset.distinct()


def build_created_at_trend(queryset, group_by):
    trunc_func = GROUP_BY_TRUNC[group_by]
    rows = (
        queryset.annotate(bucket=trunc_func("created_at"))
        .values("bucket")
        .annotate(total=Count("id"))
        .order_by("bucket")
    )
    return [
        {
            "bucket": item["bucket"].isoformat() if item["bucket"] else None,
            "total": item["total"],
        }
        for item in rows
    ]


def normalize_filters_for_cache(filters):
    normalized = {}
    for key, value in filters.items():
        if isinstance(value, datetime):
            normalized[key] = value.isoformat()
        else:
            normalized[key] = value
    return json.dumps(normalized, sort_keys=True, separators=(",", ":"))
