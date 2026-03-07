from decimal import Decimal

from django.db import migrations


PRIORITY_WEIGHTS = {
    "low": Decimal("10"),
    "medium": Decimal("20"),
    "high": Decimal("30"),
    "critical": Decimal("40"),
}
REQUEST_TYPE_WEIGHTS = {
    "normal": Decimal("10"),
    "urgent": Decimal("20"),
    "critical": Decimal("30"),
}


def _calculate_eta(distance_km):
    if distance_km is None:
        return None
    minutes = int((float(distance_km) / 30.0) * 60.0)
    return max(5, min(180, minutes + 5))


def _calculate_priority_score(request_obj, distance_km):
    priority_weight = PRIORITY_WEIGHTS.get(request_obj.priority, Decimal("20"))
    request_type_weight = REQUEST_TYPE_WEIGHTS.get(request_obj.request_type, Decimal("10"))
    distance_score = max(Decimal("0"), Decimal("100") - (distance_km * Decimal("5")))
    return (priority_weight + request_type_weight + (distance_score / Decimal("10"))).quantize(Decimal("0.01"))


def backfill_donations(apps, schema_editor):
    Donation = apps.get_model("donations", "Donation")
    BloodRequestNotification = apps.get_model("blood_requests", "BloodRequestNotification")

    status_map = {
        "pending": "pending",
        "accepted": "accepted",
        "declined": "declined",
        "expired": "expired",
    }

    for notification in BloodRequestNotification.objects.all().order_by("created_at"):
        request_obj = notification.blood_request
        donor_id = notification.donor_id
        notified_at = notification.sent_at or notification.queued_at or notification.created_at
        responded_at = notification.responded_at
        status = status_map.get(notification.response_status, "pending")
        distance_km = notification.distance_km
        eta = _calculate_eta(distance_km)
        priority_score = _calculate_priority_score(request_obj, distance_km)
        is_primary = request_obj.assigned_donor_id == donor_id and status in {
            "pending",
            "accepted",
            "en_route",
            "arrived",
        }

        response_time = None
        if notified_at and responded_at:
            delta = responded_at - notified_at
            response_time = max(0, int(delta.total_seconds() // 60))

        defaults = {
            "status": status,
            "distance_km": distance_km,
            "estimated_arrival_time": eta,
            "notified_at": notified_at,
            "priority_score": priority_score,
            "responded_at": responded_at,
            "response_time": response_time,
            "is_primary": is_primary,
            "cancellation_reason": request_obj.rejection_reason if status == "cancelled" else None,
        }
        donation, created = Donation.objects.get_or_create(
            request_id=request_obj.id,
            donor_id=donor_id,
            defaults=defaults,
        )
        if not created:
            for field, value in defaults.items():
                setattr(donation, field, value)
            donation.save()


def rollback_backfill(apps, schema_editor):
    Donation = apps.get_model("donations", "Donation")
    Donation.objects.all().delete()


class Migration(migrations.Migration):
    dependencies = [
        ("blood_requests", "0002_seed_permissions"),
        ("donations", "0002_seed_permissions"),
    ]

    operations = [
        migrations.RunPython(backfill_donations, rollback_backfill),
    ]
