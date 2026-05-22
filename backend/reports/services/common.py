import json
from datetime import datetime, timedelta
from decimal import Decimal
from statistics import median

from django.db import DatabaseError
from django.db import OperationalError
from django.db.models import Count
from django.db.models import Q
from django.db.models.functions import TruncDay, TruncMonth, TruncWeek
from django.utils import timezone

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
    if filters.get("status"):
        queryset = queryset.filter(status=filters["status"])

    if filters.get("emergency_only"):
        queryset = queryset.filter(
            Q(request__is_emergency=True) | Q(request__request_type__in=["urgent", "critical"])
        )

    return queryset.distinct()


def _normalize_created_at_for_bucket(value: datetime) -> datetime:
    if timezone.is_naive(value):
        return value
    return timezone.localtime(value)


def _bucket_start_for_group(value: datetime, group_by: str) -> datetime:
    if group_by == "day":
        return value.replace(hour=0, minute=0, second=0, microsecond=0)
    if group_by == "week":
        start = value - timedelta(days=value.weekday())
        return start.replace(hour=0, minute=0, second=0, microsecond=0)
    if group_by == "month":
        return value.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    raise ValueError(f"Unsupported group_by: {group_by}")


def _build_created_at_trend_with_db(queryset, group_by):
    trunc_func = GROUP_BY_TRUNC[group_by]
    return list(
        queryset.annotate(bucket=trunc_func("created_at"))
        .values("bucket")
        .annotate(total=Count("id"))
        .order_by("bucket")
    )


def _build_created_at_trend_with_python(queryset, group_by):
    bucket_counts = {}
    for created_at in queryset.values_list("created_at", flat=True):
        if created_at is None:
            continue
        local_value = _normalize_created_at_for_bucket(created_at)
        bucket = _bucket_start_for_group(local_value, group_by)
        bucket_counts[bucket] = bucket_counts.get(bucket, 0) + 1
    return [
        {"bucket": bucket, "total": total}
        for bucket, total in sorted(bucket_counts.items(), key=lambda item: item[0])
    ]


def build_created_at_trend(queryset, group_by):
    try:
        rows = _build_created_at_trend_with_db(queryset, group_by)
    except (ValueError, DatabaseError, OperationalError):
        rows = _build_created_at_trend_with_python(queryset, group_by)
    return [
        {
            "bucket": item["bucket"].isoformat() if item["bucket"] else None,
            "total": item["total"],
        }
        for item in rows
    ]


def _build_grouped_created_at_counts_with_db(queryset, group_by, category_field):
    trunc_func = GROUP_BY_TRUNC[group_by]
    base = queryset.annotate(bucket=trunc_func("created_at"))
    value_fields = ["bucket"]
    if category_field:
        value_fields.append(category_field)
    return list(
        base.values(*value_fields)
        .annotate(count=Count("id"))
        .order_by(*value_fields)
    )


def _build_grouped_created_at_counts_with_python(queryset, group_by, category_field):
    bucket_counts = {}
    if category_field:
        iterator = queryset.values_list("created_at", category_field)
    else:
        iterator = ((value, None) for value in queryset.values_list("created_at", flat=True))

    for created_at, category in iterator:
        if created_at is None:
            continue
        local_value = _normalize_created_at_for_bucket(created_at)
        bucket = _bucket_start_for_group(local_value, group_by)
        key = (bucket, category)
        bucket_counts[key] = bucket_counts.get(key, 0) + 1

    rows = []
    for (bucket, category), count in sorted(bucket_counts.items(), key=lambda item: (item[0][0], item[0][1] or "")):
        row = {"bucket": bucket, "count": count}
        if category_field:
            row[category_field] = category
        rows.append(row)
    return rows


def build_grouped_created_at_counts(queryset, *, group_by="day", category_field=None):
    try:
        return _build_grouped_created_at_counts_with_db(queryset, group_by, category_field)
    except (ValueError, DatabaseError, OperationalError):
        return _build_grouped_created_at_counts_with_python(queryset, group_by, category_field)


def normalize_filters_for_cache(filters):
    normalized = {}
    for key, value in filters.items():
        if isinstance(value, datetime):
            normalized[key] = value.isoformat()
        else:
            normalized[key] = value
    return json.dumps(normalized, sort_keys=True, separators=(",", ":"))
