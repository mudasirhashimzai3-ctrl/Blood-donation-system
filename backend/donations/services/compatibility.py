from donations.models import Donation

RESPONSE_STATUS_MAP = {
    "pending": "pending",
    "accepted": "accepted",
    "en_route": "accepted",
    "arrived": "accepted",
    "completed": "accepted",
    "cancelled": "declined",
    "declined": "declined",
    "expired": "expired",
}

DELIVERY_STATUS_MAP = {
    "pending": "queued",
    "accepted": "sent",
    "en_route": "sent",
    "arrived": "sent",
    "completed": "sent",
    "cancelled": "failed",
    "declined": "sent",
    "expired": "failed",
}


def donation_to_notification_payload(donation: Donation) -> dict:
    return {
        "id": donation.id,
        "donor": donation.donor_id,
        "donor_name": str(donation.donor),
        "donor_phone": donation.donor.phone,
        "distance_km": str(donation.distance_km),
        "channel": "in_app",
        "delivery_status": DELIVERY_STATUS_MAP.get(donation.status, "queued"),
        "response_status": RESPONSE_STATUS_MAP.get(donation.status, "pending"),
        "queued_at": donation.notified_at,
        "sent_at": donation.notified_at,
        "responded_at": donation.responded_at,
        "failure_reason": donation.cancellation_reason,
        "created_at": donation.created_at,
        "updated_at": donation.updated_at,
    }


def get_legacy_notifications_for_request(blood_request):
    queryset = Donation.objects.select_related("donor").filter(
        request=blood_request,
        deleted_at__isnull=True,
    ).order_by("distance_km", "-notified_at")
    return [donation_to_notification_payload(item) for item in queryset]
