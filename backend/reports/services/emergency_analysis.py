from collections import Counter

from django.db.models import Q
from django.db.models import Min
from django.utils import timezone

from blood_requests.models import BloodRequest
from donations.models import Donation

from .common import apply_request_filters, duration_minutes, pct, safe_avg


def _bucket_delay(minutes):
    if minutes is None:
        return "unknown"
    if minutes <= 15:
        return "0-15m"
    if minutes <= 30:
        return "16-30m"
    if minutes <= 60:
        return "31-60m"
    return "60m+"


def build_emergency_analysis(filters: dict):
    queryset = BloodRequest.objects.select_related("hospital", "recipient")
    queryset = apply_request_filters(queryset, filters)
    queryset = queryset.filter(Q(is_emergency=True) | Q(request_type__in=["urgent", "critical"])).distinct()

    total = queryset.count()
    urgent_count = queryset.filter(request_type="urgent").count()
    critical_count = queryset.filter(request_type="critical").count()
    completed_count = queryset.filter(status="completed").count()
    overdue_count = queryset.filter(status="pending", response_deadline__lt=timezone.now()).count()

    first_responses = {
        item["request_id"]: item["first_response"]
        for item in Donation.objects.filter(request__in=queryset, response_time__isnull=False)
        .values("request_id")
        .annotate(first_response=Min("response_time"))
    }

    first_response_values = list(first_responses.values())
    delay_counter = Counter(_bucket_delay(value) for value in first_response_values)

    avg_match = safe_avg(
        [duration_minutes(row.created_at, row.matched_at) for row in queryset if row.matched_at is not None]
    )
    avg_complete = safe_avg(
        [duration_minutes(row.created_at, row.completed_at) for row in queryset if row.completed_at is not None]
    )

    rejection_reasons = list(
        queryset.exclude(rejection_reason__isnull=True)
        .exclude(rejection_reason="")
        .values_list("rejection_reason", flat=True)
    )
    cancellation_reasons = list(
        Donation.objects.filter(request__in=queryset)
        .exclude(cancellation_reason__isnull=True)
        .exclude(cancellation_reason="")
        .values_list("cancellation_reason", flat=True)
    )

    reason_counter = Counter(rejection_reasons + cancellation_reasons)

    return {
        "summary": {
            "total_emergency_requests": total,
            "urgent_requests": urgent_count,
            "critical_requests": critical_count,
            "completion_rate": pct(completed_count, total),
            "overdue_pending_count": overdue_count,
            "avg_first_response_time_minutes": safe_avg(first_response_values),
            "avg_match_time_minutes": avg_match,
            "avg_completion_time_minutes": avg_complete,
        },
        "delay_buckets": [
            {"label": label, "count": delay_counter.get(label, 0), "percentage": pct(delay_counter.get(label, 0), total)}
            for label in ["0-15m", "16-30m", "31-60m", "60m+", "unknown"]
        ],
        "top_bottlenecks": [
            {"reason": reason, "count": count}
            for reason, count in reason_counter.most_common(10)
        ],
        "meta": {
            "date_from": filters["date_from"].isoformat(),
            "date_to": filters["date_to"].isoformat(),
            "record_count": total,
        },
    }
