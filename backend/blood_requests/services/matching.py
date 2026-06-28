import math
from datetime import timedelta
from decimal import Decimal

from django.utils import timezone

from core.services.settings_service import get_runtime_section_payload
from donations.models import Donation
from donors.models import Donor
from donors.services.blood_groups import get_compatible_donor_groups
from donors.services.eligibility import get_donor_eligibility

from ..models import BloodRequest, BloodRequestNotification
from donations.services.sync import sync_donations_for_matches

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


def get_max_match_radius_km() -> Decimal:
    default_value = MAX_MATCH_RADIUS_KM
    try:
        payload = get_runtime_section_payload("auto_matching")
        raw_value = payload.get("max_distance_km", default_value)
        value = Decimal(str(raw_value))
        if value not in {Decimal("10"), Decimal("20"), Decimal("50"), Decimal("100")}:
            return default_value
        return value
    except Exception:
        return default_value


def get_max_candidates_to_notify(default: int = 50) -> int:
    try:
        payload = get_runtime_section_payload("auto_matching")
        value = int(payload.get("max_candidates_to_notify", default))
        return value if value > 0 else default
    except Exception:
        return default


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

    if blood_request.status != "pending" or blood_request.assigned_donor_id:
        return []

    if not blood_request.auto_match_enabled:
        blood_request.nearby_donors_count = 0
        blood_request.save(update_fields=["nearby_donors_count", "updated_at"])
        return []

    compatible_groups = get_compatible_donor_groups(blood_request.blood_group)
    eligible_donors = (
        Donor.objects.filter(
            status="active",
            blood_group__in=compatible_groups,
            latitude__isnull=False,
            longitude__isnull=False,
        )
        .order_by("last_donation_date", "created_at")
    )

    match_radius_km = get_max_match_radius_km()
    within_radius = []
    for donor in eligible_donors:
        if not get_donor_eligibility(donor.last_donation_date)["is_eligible"]:
            continue
        distance_km = haversine_distance_km(
            blood_request.location_lat,
            blood_request.location_lon,
            donor.latitude,
            donor.longitude,
        )
        if distance_km <= match_radius_km:
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
    newly_queued_candidates = []
    for donor, distance_km in selected_candidates:
        existing_notification = BloodRequestNotification.objects.filter(
            blood_request=blood_request,
            donor=donor,
            channel="in_app",
        ).first()
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
        if existing_notification is None or existing_notification.response_status != "pending":
            newly_queued_candidates.append((donor, distance_km))

    sync_donations_for_matches(
        blood_request=blood_request,
        selected_candidates=selected_candidates,
    )

    total_notified = (
        BloodRequestNotification.objects.filter(blood_request=blood_request, channel="in_app")
        .values("donor_id")
        .distinct()
        .count()
    )

    blood_request.nearby_donors_count = len(within_radius)
    blood_request.total_notified_donors = total_notified
    blood_request.save(update_fields=["nearby_donors_count", "total_notified_donors", "updated_at"])

    _notify_matched_donor_users(
        blood_request=blood_request,
        selected_candidates=newly_queued_candidates,
    )

    return created_or_updated


def auto_assign_primary_candidate(blood_request: BloodRequest):
    if blood_request.status != "pending":
        return None

    primary_candidate = (
        Donation.objects.filter(
            request=blood_request,
            deleted_at__isnull=True,
            status="pending",
        )
        .select_related("donor")
        .order_by("distance_km", "created_at")
        .first()
    )
    if not primary_candidate:
        return None

    now = timezone.now()
    Donation.objects.filter(
        request=blood_request,
        deleted_at__isnull=True,
        is_primary=True,
        status__in=Donation.PRIMARY_ACTIVE_STATUSES,
    ).exclude(pk=primary_candidate.pk).update(is_primary=False, updated_at=now)

    if not primary_candidate.is_primary:
        primary_candidate.is_primary = True
        primary_candidate.save(update_fields=["is_primary", "updated_at"])

    return primary_candidate.donor


def _notify_matched_donor_users(*, blood_request: BloodRequest, selected_candidates):
    user_ids = [donor.user_id for donor, _distance in selected_candidates if donor.user_id]
    if not user_ids:
        return

    try:
        from notifications.services import create_notifications

        create_notifications(
            event_key="blood_request_created",
            type="reminder",
            title=f"New blood request #{blood_request.id}",
            message=(
                f"A {blood_request.request_type} request for blood group {blood_request.blood_group} "
                f"is available near {blood_request.hospital.name}."
            ),
            title_key="notification.matched_donor.title",
            message_key="notification.matched_donor.message",
            template_params={
                "request_id": blood_request.id,
                "request_type": blood_request.request_type,
                "blood_group": blood_request.blood_group,
                "hospital_name": blood_request.hospital.name,
            },
            sent_via=["in_app"],
            user_ids=user_ids,
            request_id=blood_request.id,
            metadata={
                "status": blood_request.status,
                "blood_group": blood_request.blood_group,
                "request_type": blood_request.request_type,
            },
        )
    except Exception:
        return
