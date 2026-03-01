import math
from datetime import timedelta
from decimal import Decimal

from django.db.models import Q
from django.utils import timezone

from donors.models import Donor

from ..models import BloodRequest, BloodRequestNotification

DONOR_COOLDOWN_DAYS = 56
MAX_MATCH_RADIUS_KM = Decimal("10")

ETA_MINUTES_BY_REQUEST_TYPE = {
    "normal": 360,
    "urgent": 180,
    "critical": 60,
}


def get_eta_minutes(request_type: str) -> int:
    return ETA_MINUTES_BY_REQUEST_TYPE.get(request_type, ETA_MINUTES_BY_REQUEST_TYPE["normal"])


def default_response_deadline(request_type: str):
    eta_minutes = get_eta_minutes(request_type)
    return timezone.now() + timedelta(minutes=eta_minutes)


def haversine_distance_km(lat1: Decimal, lon1: Decimal, lat2: Decimal, lon2: Decimal) -> Decimal:
    lat1_f, lon1_f = float(lat1), float(lon1)
    lat2_f, lon2_f = float(lat2), float(lon2)

    radius_km = 6371.0
    phi1 = math.radians(lat1_f)
    phi2 = math.radians(lat2_f)
    delta_phi = math.radians(lat2_f - lat1_f)
    delta_lambda = math.radians(lon2_f - lon1_f)

    a = (
        math.sin(delta_phi / 2) ** 2
        + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    distance = radius_km * c
    return Decimal(f"{distance:.2f}")


def apply_request_defaults(blood_request: BloodRequest):
    eta_minutes = get_eta_minutes(blood_request.request_type)
    changed_fields = []

    if not blood_request.estimated_time_to_fulfill:
        blood_request.estimated_time_to_fulfill = eta_minutes
        changed_fields.append("estimated_time_to_fulfill")

    if not blood_request.response_deadline:
        blood_request.response_deadline = default_response_deadline(blood_request.request_type)
        changed_fields.append("response_deadline")

    if blood_request.request_type != "normal" and not blood_request.is_emergency:
        blood_request.is_emergency = True
        changed_fields.append("is_emergency")
    elif blood_request.request_type == "normal" and blood_request.is_emergency:
        blood_request.is_emergency = False
        changed_fields.append("is_emergency")

    if changed_fields:
        changed_fields.append("updated_at")
        blood_request.save(update_fields=changed_fields)


def auto_match_blood_request(blood_request: BloodRequest, *, max_notifications: int = 50):
    apply_request_defaults(blood_request)

    if not blood_request.auto_match_enabled:
        blood_request.nearby_donors_count = 0
        blood_request.save(update_fields=["nearby_donors_count", "updated_at"])
        return []

    eligibility_cutoff = timezone.localdate() - timedelta(days=DONOR_COOLDOWN_DAYS)
    eligible_donors = (
        Donor.objects.filter(
            status="active",
            blood_group=blood_request.blood_group,
            latitude__isnull=False,
            longitude__isnull=False,
        )
        .filter(Q(last_donation_date__isnull=True) | Q(last_donation_date__lte=eligibility_cutoff))
        .order_by("last_donation_date", "created_at")
    )

    within_radius = []
    for donor in eligible_donors:
        distance_km = haversine_distance_km(
            blood_request.location_lat,
            blood_request.location_lon,
            donor.latitude,
            donor.longitude,
        )
        if distance_km <= MAX_MATCH_RADIUS_KM:
            within_radius.append((donor, distance_km))

    within_radius.sort(
        key=lambda item: (
            item[1],
            item[0].last_donation_date or timezone.localdate() - timedelta(days=10000),
        )
    )

    selected_candidates = within_radius[:max_notifications]
    now = timezone.now()
    selected_donor_ids = [donor.id for donor, _ in selected_candidates]

    (
        BloodRequestNotification.objects.filter(
            blood_request=blood_request,
            channel="in_app",
            response_status="pending",
        )
        .exclude(donor_id__in=selected_donor_ids)
        .update(response_status="expired", updated_at=now)
    )

    created_or_updated = []
    for donor, distance_km in selected_candidates:
        notification, _ = BloodRequestNotification.objects.update_or_create(
            blood_request=blood_request,
            donor=donor,
            channel="in_app",
            defaults={
                "distance_km": distance_km,
                "delivery_status": "queued",
                "response_status": "pending",
                "queued_at": now,
                "failure_reason": None,
                "responded_at": None,
            },
        )
        created_or_updated.append(notification)

    total_notified = (
        BloodRequestNotification.objects.filter(blood_request=blood_request, channel="in_app")
        .values("donor_id")
        .distinct()
        .count()
    )

    blood_request.nearby_donors_count = len(within_radius)
    blood_request.total_notified_donors = total_notified
    blood_request.save(update_fields=["nearby_donors_count", "total_notified_donors", "updated_at"])

    return created_or_updated
