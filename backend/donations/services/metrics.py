import math
from decimal import Decimal

REQUEST_TYPE_WEIGHTS = {
    "normal": Decimal("10"),
    "urgent": Decimal("20"),
    "critical": Decimal("30"),
}


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


def calculate_estimated_arrival_time(distance_km: Decimal | None) -> int | None:
    if distance_km is None:
        return None

    raw_minutes = math.ceil((float(distance_km) / 30.0) * 60.0) + 5
    return max(5, min(180, raw_minutes))


def calculate_priority_score(*, distance_km: Decimal, request_type: str) -> Decimal:
    request_type_weight = REQUEST_TYPE_WEIGHTS.get(request_type, Decimal("10"))
    distance_score = max(Decimal("0"), Decimal("100") - (distance_km * Decimal("5")))
    score = request_type_weight + (distance_score / Decimal("10"))
    return score.quantize(Decimal("0.01"))


def build_distance_eta_priority_snapshot(*, blood_request, donor):
    distance_km = haversine_distance_km(
        blood_request.location_lat,
        blood_request.location_lon,
        donor.latitude,
        donor.longitude,
    )
    estimated_arrival_time = calculate_estimated_arrival_time(distance_km)
    priority_score = calculate_priority_score(
        distance_km=distance_km,
        request_type=blood_request.request_type,
    )
    return distance_km, estimated_arrival_time, priority_score
