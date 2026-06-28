from django.db import transaction

from blood_requests.models import BloodRequest
from blood_requests.services.matching import (
    auto_assign_primary_candidate,
    auto_match_blood_request,
    get_max_candidates_to_notify,
)

try:
    from celery import shared_task
except ImportError:  # pragma: no cover
    def shared_task(*dargs, **dkwargs):
        def decorator(func):
            return func

        if dargs and callable(dargs[0]) and len(dargs) == 1 and not dkwargs:
            return dargs[0]
        return decorator


@shared_task(name="blood_requests.run_request_automation")
def run_request_automation(request_id: int):
    blood_request = (
        BloodRequest.objects.select_related("hospital", "recipient")
        .filter(pk=request_id, deleted_at__isnull=True)
        .first()
    )
    if blood_request is None:
        return {"status": "not_found"}

    if blood_request.status != "pending" or blood_request.assigned_donor_id:
        return {"status": "closed"}

    with transaction.atomic():
        locked = (
            BloodRequest.objects.select_for_update()
            .select_related("hospital", "recipient")
            .filter(pk=request_id, deleted_at__isnull=True)
            .first()
        )
        if locked is None or locked.status != "pending" or locked.assigned_donor_id:
            return {"status": "closed"}

        notifications = auto_match_blood_request(
            locked,
            max_notifications=get_max_candidates_to_notify(),
        )
        primary_candidate = auto_assign_primary_candidate(locked)

    return {
        "status": "ok",
        "request_id": request_id,
        "candidates": len(notifications),
        "primary_candidate_donor_id": primary_candidate.id if primary_candidate else None,
    }
