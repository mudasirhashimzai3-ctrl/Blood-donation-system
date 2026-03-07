from django.utils import timezone

from reports.models import ReportExportJob
from reports.services.exports import cleanup_expired_exports, generate_export_artifact

try:
    from celery import shared_task
except ImportError:  # pragma: no cover
    def shared_task(*dargs, **dkwargs):
        def decorator(func):
            return func

        if dargs and callable(dargs[0]) and len(dargs) == 1 and not dkwargs:
            return dargs[0]
        return decorator


@shared_task(name="reports.generate_report_export")
def generate_report_export(export_job_id: int):
    job = ReportExportJob.objects.filter(id=export_job_id).first()
    if not job:
        return {"status": "missing", "job_id": export_job_id}

    job.status = "processing"
    job.started_at = timezone.now()
    job.save(update_fields=["status", "started_at", "updated_at"])

    try:
        generate_export_artifact(job)
        return {"status": "completed", "job_id": export_job_id}
    except Exception as exc:  # pragma: no cover
        job.status = "failed"
        job.error_message = str(exc)
        job.completed_at = timezone.now()
        job.save(update_fields=["status", "error_message", "completed_at", "updated_at"])
        return {"status": "failed", "job_id": export_job_id, "error": str(exc)}


@shared_task(name="reports.cleanup_expired_exports")
def cleanup_expired_exports_task(days: int = 7):
    cleaned = cleanup_expired_exports(days=days)
    return {"expired": cleaned}
