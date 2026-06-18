try:
    from celery import shared_task
except ImportError:  # pragma: no cover
    def shared_task(*dargs, **dkwargs):
        def decorator(func):
            return func

        if dargs and callable(dargs[0]) and len(dargs) == 1 and not dkwargs:
            return dargs[0]
        return decorator

from core.services.backup_service import create_scheduled_backup


@shared_task(name="core.run_scheduled_backup")
def run_scheduled_backup(backup_type: str):
    return create_scheduled_backup(backup_type)
