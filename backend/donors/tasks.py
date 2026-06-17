try:
    from celery import shared_task
except ImportError:  # pragma: no cover
    def shared_task(*dargs, **dkwargs):
        def decorator(func):
            return func

        if dargs and callable(dargs[0]) and len(dargs) == 1 and not dkwargs:
            return dargs[0]
        return decorator

from donors.services.eligibility import refresh_donor_availability


@shared_task(name="donors.refresh_donor_availability")
def refresh_donor_availability_task():
    return {"updated": refresh_donor_availability()}
