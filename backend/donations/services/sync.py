from django.utils import timezone

from donations.models import Donation
from donations.services.metrics import build_distance_eta_priority_snapshot


def _compute_response_time_minutes(notified_at, responded_at):
    if not notified_at or not responded_at:
        return None
    delta = responded_at - notified_at
    return max(0, int(delta.total_seconds() // 60))


def sync_donations_for_matches(*, blood_request, selected_candidates):
    now = timezone.now()
    selected_by_donor_id = {donor.id: (donor, distance_km) for donor, distance_km in selected_candidates}
    selected_donor_ids = list(selected_by_donor_id.keys())

    existing = Donation.objects.filter(
        request=blood_request,
        donor_id__in=selected_donor_ids,
        deleted_at__isnull=True,
    ).select_related("donor")
    existing_by_donor_id = {item.donor_id: item for item in existing}

    synced = []
    for donor_id, (donor, _) in selected_by_donor_id.items():
        distance_km, eta_minutes, priority_score = build_distance_eta_priority_snapshot(
            blood_request=blood_request,
            donor=donor,
        )
        donation = existing_by_donor_id.get(donor_id)

        if donation is None:
            donation = Donation.objects.create(
                request=blood_request,
                donor=donor,
                status="pending",
                distance_km=distance_km,
                estimated_arrival_time=eta_minutes,
                notified_at=now,
                priority_score=priority_score,
            )
            synced.append(donation)
            continue

        donation.distance_km = distance_km
        donation.estimated_arrival_time = eta_minutes
        donation.priority_score = priority_score

        if donation.status in {"pending", "expired"}:
            donation.status = "pending"
            donation.notified_at = now
            donation.responded_at = None
            donation.response_time = None
            donation.reminder_count = 0
            donation.reminder_sent_at = None

        donation.save(
            update_fields=[
                "distance_km",
                "estimated_arrival_time",
                "priority_score",
                "status",
                "notified_at",
                "responded_at",
                "response_time",
                "reminder_count",
                "reminder_sent_at",
                "updated_at",
            ]
        )
        synced.append(donation)

    stale_pending = Donation.objects.filter(
        request=blood_request,
        status="pending",
        deleted_at__isnull=True,
    ).exclude(donor_id__in=selected_donor_ids)

    for donation in stale_pending:
        donation.status = "expired"
        donation.responded_at = now
        donation.response_time = _compute_response_time_minutes(donation.notified_at, now)
        donation.save(update_fields=["status", "responded_at", "response_time", "updated_at"])

    primary = None
    if blood_request.assigned_donor_id:
        primary = Donation.objects.filter(
            request=blood_request,
            donor_id=blood_request.assigned_donor_id,
            deleted_at__isnull=True,
        ).first()
        if primary:
            Donation.objects.filter(
                request=blood_request,
                deleted_at__isnull=True,
                is_primary=True,
            ).exclude(pk=primary.pk).update(is_primary=False, updated_at=now)
            primary.is_primary = True
            if primary.status == "pending":
                primary.status = "accepted"
                primary.responded_at = now
                primary.response_time = _compute_response_time_minutes(primary.notified_at, now)
            primary.save(
                update_fields=[
                    "is_primary",
                    "status",
                    "responded_at",
                    "response_time",
                    "updated_at",
                ]
            )

    return synced


def expire_pending_donations_for_request(*, blood_request, cancellation_reason=None):
    now = timezone.now()
    pending_items = Donation.objects.filter(
        request=blood_request,
        status__in=["pending", "accepted", "en_route", "arrived"],
        deleted_at__isnull=True,
    )
    for donation in pending_items:
        donation.status = "cancelled"
        donation.cancellation_reason = cancellation_reason
        donation.responded_at = donation.responded_at or now
        donation.response_time = donation.response_time or _compute_response_time_minutes(
            donation.notified_at,
            donation.responded_at,
        )
        donation.save(
            update_fields=[
                "status",
                "cancellation_reason",
                "responded_at",
                "response_time",
                "updated_at",
            ]
        )
