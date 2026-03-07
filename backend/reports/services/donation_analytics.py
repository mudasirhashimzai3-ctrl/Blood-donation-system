from collections import OrderedDict

from django.db.models import Count

from donations.models import Donation

from .common import apply_donation_filters, as_float, build_created_at_trend, pct, safe_avg, safe_median


def _bucket_distance(distance):
    if distance is None:
        return "unknown"
    value = float(distance)
    if value < 2:
        return "0-2km"
    if value < 5:
        return "2-5km"
    if value < 10:
        return "5-10km"
    return "10km+"


def _bucket_response_minutes(minutes):
    if minutes is None:
        return "unknown"
    if minutes <= 15:
        return "0-15m"
    if minutes <= 30:
        return "16-30m"
    if minutes <= 60:
        return "31-60m"
    return "60m+"


def build_donation_analytics(filters: dict):
    queryset = Donation.objects.select_related("request", "request__hospital", "donor")
    queryset = apply_donation_filters(queryset, filters)

    total = queryset.count()
    status_counts = {item["status"]: item["count"] for item in queryset.values("status").annotate(count=Count("id"))}
    completed = status_counts.get("completed", 0)
    accepted_or_beyond = sum(
        status_counts.get(key, 0) for key in ["accepted", "en_route", "arrived", "completed"]
    )

    response_times = list(queryset.values_list("response_time", flat=True))
    eta_values = list(queryset.values_list("estimated_arrival_time", flat=True))
    distance_values = [as_float(v) for v in queryset.values_list("distance_km", flat=True)]

    reminded = queryset.filter(reminder_count__gt=0)
    reminded_count = reminded.count()
    reminder_converted = reminded.filter(status__in=["accepted", "en_route", "arrived", "completed"]).count()

    distance_buckets = OrderedDict(
        (key, 0) for key in ["0-2km", "2-5km", "5-10km", "10km+", "unknown"]
    )
    response_buckets = OrderedDict(
        (key, 0) for key in ["0-15m", "16-30m", "31-60m", "60m+", "unknown"]
    )

    for distance in queryset.values_list("distance_km", flat=True):
        distance_buckets[_bucket_distance(distance)] += 1
    for response_time in response_times:
        response_buckets[_bucket_response_minutes(response_time)] += 1

    return {
        "summary": {
            "total_donations": total,
            "status_counts": status_counts,
            "response_rate": pct(sum(1 for value in response_times if value is not None), total),
            "acceptance_rate": pct(accepted_or_beyond, total),
            "completion_rate": pct(completed, total),
            "avg_response_time_minutes": safe_avg(response_times),
            "median_response_time_minutes": safe_median(response_times),
            "avg_eta_minutes": safe_avg(eta_values),
            "avg_distance_km": safe_avg(distance_values),
            "reminder_conversion_rate": pct(reminder_converted, reminded_count),
        },
        "trends": build_created_at_trend(queryset, filters["group_by"]),
        "distributions": {
            "distance_buckets": [
                {"label": label, "count": count, "percentage": pct(count, total)}
                for label, count in distance_buckets.items()
            ],
            "response_time_buckets": [
                {"label": label, "count": count, "percentage": pct(count, total)}
                for label, count in response_buckets.items()
            ],
        },
        "meta": {
            "group_by": filters["group_by"],
            "date_from": filters["date_from"].isoformat(),
            "date_to": filters["date_to"].isoformat(),
            "record_count": total,
        },
    }
