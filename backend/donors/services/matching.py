from decimal import Decimal

from blood_requests.services.matching import haversine_distance_km
from donors.models import Donor
from donors.services.blood_groups import get_compatible_donor_groups, get_match_type

ALLOWED_RADIUS_KM = (10, 20, 50, 100)


def normalize_radius_km(value, *, default=10) -> int:
    try:
        radius = int(Decimal(str(value)))
    except Exception:
        return default
    return radius if radius in ALLOWED_RADIUS_KM else default


def build_donor_candidates(*, blood_group: str, origin_lat, origin_lon, radius_km):
    radius = Decimal(str(radius_km))
    compatible_groups = get_compatible_donor_groups(blood_group)
    donors = Donor.objects.filter(
        status="active",
        blood_group__in=compatible_groups,
        latitude__isnull=False,
        longitude__isnull=False,
    ).order_by("created_at")

    candidates = []
    for donor in donors:
        distance_km = haversine_distance_km(origin_lat, origin_lon, donor.latitude, donor.longitude)
        if distance_km <= radius:
            candidates.append(
                {
                    "donor": donor,
                    "distance_km": distance_km,
                    "match_type": get_match_type(donor.blood_group, blood_group),
                }
            )

    return sorted(candidates, key=lambda item: (item["distance_km"], item["donor"].last_name, item["donor"].first_name))
