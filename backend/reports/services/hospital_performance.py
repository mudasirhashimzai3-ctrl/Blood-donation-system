from django.db.models import Avg

from blood_requests.models import BloodRequest
from donations.models import Donation
from hospitals.models import Hospital

from .common import apply_donation_filters, apply_request_filters, duration_minutes, pct, safe_avg


def _avg_request_minutes(queryset, field_name):
    values = []
    for row in queryset.only("created_at", field_name):
        values.append(duration_minutes(row.created_at, getattr(row, field_name)))
    return safe_avg(values)


def build_hospital_performance(filters: dict):
    hospitals_qs = Hospital.objects.all()
    if filters.get("hospital_id"):
        hospitals_qs = hospitals_qs.filter(id=filters["hospital_id"])
    if filters.get("city"):
        hospitals_qs = hospitals_qs.filter(city__icontains=filters["city"])

    rows = []
    total_requests = 0

    for hospital in hospitals_qs:
        requests_qs = apply_request_filters(BloodRequest.objects.filter(hospital=hospital), filters)
        donations_qs = apply_donation_filters(Donation.objects.filter(request__hospital=hospital), filters)

        request_volume = requests_qs.count()
        total_requests += request_volume
        if request_volume == 0 and donations_qs.count() == 0:
            continue

        emergency_requests = requests_qs.filter(is_emergency=True).count() + requests_qs.filter(
            request_type__in=["urgent", "critical"]
        ).exclude(is_emergency=True).count()
        completed_requests = requests_qs.filter(status="completed").count()
        cancelled_requests = requests_qs.filter(status="cancelled").count()

        avg_distance = donations_qs.aggregate(value=Avg("distance_km"))["value"]
        avg_response = donations_qs.aggregate(value=Avg("response_time"))["value"]

        rows.append(
            {
                "hospital_id": hospital.id,
                "hospital_name": hospital.name,
                "city": hospital.city,
                "request_volume": request_volume,
                "emergency_share": pct(emergency_requests, request_volume),
                "completion_rate": pct(completed_requests, request_volume),
                "cancellation_rate": pct(cancelled_requests, request_volume),
                "avg_match_time_minutes": _avg_request_minutes(
                    requests_qs.filter(matched_at__isnull=False),
                    "matched_at",
                ),
                "avg_completion_time_minutes": _avg_request_minutes(
                    requests_qs.filter(completed_at__isnull=False),
                    "completed_at",
                ),
                "avg_donation_distance_km": float(avg_distance) if avg_distance is not None else None,
                "avg_donation_response_time_minutes": float(avg_response) if avg_response is not None else None,
            }
        )

    average_completion = safe_avg([row["completion_rate"] for row in rows])

    return {
        "summary": {
            "hospitals_count": len(rows),
            "total_requests": total_requests,
            "avg_completion_rate": average_completion,
        },
        "rows": rows,
        "meta": {
            "date_from": filters["date_from"].isoformat(),
            "date_to": filters["date_to"].isoformat(),
            "record_count": len(rows),
        },
    }
