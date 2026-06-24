from donors.services.blood_groups import get_compatible_donor_groups
from donors.services.eligibility import get_donor_eligibility

from donations.services.metrics import build_distance_eta_snapshot


def get_donation_actionability_failure(donation) -> tuple[str | None, tuple | None]:
    donor = donation.donor
    blood_request = donation.request

    if getattr(blood_request, "deleted_at", None) is not None or not blood_request.is_active:
        return "This request is no longer open.", None

    if blood_request.status != "pending" or blood_request.assigned_donor_id:
        return "This request is no longer open.", None

    if donor.blood_group not in get_compatible_donor_groups(blood_request.blood_group):
        return "Your blood group is not compatible with this request.", None

    if donor.status != "active":
        return "You are not currently eligible to donate blood.", None

    if not get_donor_eligibility(donor.last_donation_date)["is_eligible"]:
        return "You are not currently eligible to donate blood.", None

    if (
        donor.latitude is None
        or donor.longitude is None
        or blood_request.location_lat is None
        or blood_request.location_lon is None
    ):
        return "Location coordinates are required before this request can be accepted.", None

    from blood_requests.services.matching import get_max_match_radius_km

    distance_km, eta_minutes = build_distance_eta_snapshot(
        blood_request=blood_request,
        donor=donor,
    )
    if distance_km > get_max_match_radius_km():
        return "This request is outside the maximum donor distance.", (distance_km, eta_minutes)

    return None, (distance_km, eta_minutes)


def is_actionable_donation_request(donation) -> bool:
    failure, _snapshot = get_donation_actionability_failure(donation)
    return failure is None


def filter_actionable_donations(queryset):
    rows = list(queryset.select_related("request", "donor"))
    matching_ids = [row.id for row in rows if is_actionable_donation_request(row)]
    return queryset.filter(id__in=matching_ids)
