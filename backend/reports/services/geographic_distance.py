from collections import Counter

from django.db.models import Avg, Count

from blood_requests.models import BloodRequest
from donations.models import Donation

from .common import apply_donation_filters, apply_request_filters, pct, safe_avg


def _distance_band(distance):
    value = float(distance or 0)
    if value < 2:
        return "0-2km"
    if value < 5:
        return "2-5km"
    if value < 10:
        return "5-10km"
    return "10km+"


def build_geographic_distance(filters: dict):
    donations_qs = apply_donation_filters(
        Donation.objects.select_related("request", "request__hospital", "donor"),
        filters,
    )
    requests_qs = apply_request_filters(BloodRequest.objects.select_related("hospital"), filters)

    total = donations_qs.count()
    distance_values = [float(value) for value in donations_qs.values_list("distance_km", flat=True)]
    eta_values = [value for value in donations_qs.values_list("estimated_arrival_time", flat=True) if value is not None]

    band_counter = Counter(_distance_band(value) for value in donations_qs.values_list("distance_km", flat=True))

    eta_by_band = []
    for label in ["0-2km", "2-5km", "5-10km", "10km+"]:
        matching = [
            donation.estimated_arrival_time
            for donation in donations_qs
            if _distance_band(donation.distance_km) == label and donation.estimated_arrival_time is not None
        ]
        eta_by_band.append(
            {
                "label": label,
                "avg_eta_minutes": safe_avg(matching),
            }
        )

    city_distribution = list(
        requests_qs.values("hospital__city")
        .annotate(count=Count("id"))
        .order_by("-count", "hospital__city")
    )
    hospital_distribution = list(
        requests_qs.values("hospital_id", "hospital__name")
        .annotate(count=Count("id"))
        .order_by("-count", "hospital__name")
    )

    farthest_cases = [
        {
            "donation_id": donation.id,
            "request_id": donation.request_id,
            "donor_id": donation.donor_id,
            "donor_name": str(donation.donor),
            "hospital_name": donation.request.hospital.name,
            "city": donation.request.hospital.city,
            "distance_km": float(donation.distance_km),
            "estimated_arrival_time": donation.estimated_arrival_time,
            "status": donation.status,
        }
        for donation in donations_qs.order_by("-distance_km")[:20]
    ]

    coverage_gap_count = requests_qs.filter(nearby_donors_count__lt=3).count()

    return {
        "summary": {
            "total_donations": total,
            "avg_distance_km": safe_avg(distance_values),
            "max_distance_km": max(distance_values) if distance_values else None,
            "avg_eta_minutes": safe_avg(eta_values),
            "coverage_gap_count": coverage_gap_count,
        },
        "distance_bands": [
            {"label": label, "count": band_counter.get(label, 0), "percentage": pct(band_counter.get(label, 0), total)}
            for label in ["0-2km", "2-5km", "5-10km", "10km+"]
        ],
        "eta_by_distance_band": eta_by_band,
        "city_distribution": [
            {"city": row["hospital__city"], "count": row["count"]}
            for row in city_distribution
        ],
        "hospital_distribution": [
            {"hospital_id": row["hospital_id"], "hospital_name": row["hospital__name"], "count": row["count"]}
            for row in hospital_distribution
        ],
        "farthest_cases": farthest_cases,
        "meta": {
            "date_from": filters["date_from"].isoformat(),
            "date_to": filters["date_to"].isoformat(),
            "record_count": total,
        },
    }
