import hashlib
import shutil
import tempfile
import zipfile
from pathlib import Path

from django.apps import apps
from django.conf import settings
from django.core.management import call_command
from django.db import transaction
from django.utils import timezone

from core.models import BackupRecord
from core.services.settings_service import get_runtime_section_payload

DATA_FILENAME = "data.json"
MEDIA_PREFIX = "media"
BACKUP_APPS = [
    "accounts",
    "core",
    "donors",
    "recipients",
    "hospitals",
    "blood_requests",
    "donations",
    "notifications",
    "reports",
]


def get_backup_root() -> Path:
    root = Path(getattr(settings, "BACKUP_ROOT", settings.BASE_DIR / "backups"))
    root.mkdir(parents=True, exist_ok=True)
    return root


def _backup_filename(backup_type: str) -> str:
    timestamp = timezone.now().strftime("%Y%m%d_%H%M%S")
    return f"{backup_type}_backup_{timestamp}.zip"


def _calculate_sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as file_obj:
        for chunk in iter(lambda: file_obj.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _write_media_files(zip_file: zipfile.ZipFile):
    media_root = Path(settings.MEDIA_ROOT)
    if not media_root.exists():
        return

    for path in media_root.rglob("*"):
        if path.is_file():
            zip_file.write(path, f"{MEDIA_PREFIX}/{path.relative_to(media_root).as_posix()}")


def create_backup(*, backup_type: str = "manual", user=None) -> BackupRecord:
    record = BackupRecord.objects.create(
        backup_type=backup_type,
        status="running",
        created_by=user if getattr(user, "is_authenticated", False) else None,
        started_at=timezone.now(),
    )

    try:
        backup_path = get_backup_root() / _backup_filename(backup_type)
        with tempfile.TemporaryDirectory() as temp_dir:
            data_path = Path(temp_dir) / DATA_FILENAME
            call_command(
                "dumpdata",
                *BACKUP_APPS,
                "--natural-foreign",
                "--natural-primary",
                "--indent",
                "2",
                output=str(data_path),
                verbosity=0,
            )
            with zipfile.ZipFile(backup_path, "w", zipfile.ZIP_DEFLATED) as zip_file:
                zip_file.write(data_path, DATA_FILENAME)
                _write_media_files(zip_file)

        record.file_path = str(backup_path)
        record.file_size = backup_path.stat().st_size
        record.checksum = _calculate_sha256(backup_path)
        record.status = "completed"
        record.finished_at = timezone.now()
        record.save(update_fields=["file_path", "file_size", "checksum", "status", "finished_at", "updated_at"])
    except Exception as exc:
        record.status = "failed"
        record.error_message = str(exc)
        record.finished_at = timezone.now()
        record.save(update_fields=["status", "error_message", "finished_at", "updated_at"])

    return record


def is_schedule_enabled(backup_type: str) -> bool:
    schedule = get_runtime_section_payload("backup_restore")
    return bool(schedule.get(f"{backup_type}_enabled", False))


def prune_old_backups(backup_type: str):
    schedule = get_runtime_section_payload("backup_restore")
    keep_count = int(schedule.get(f"{backup_type}_retention_count", 0) or 0)
    if keep_count <= 0:
        return

    old_records = BackupRecord.objects.filter(
        backup_type=backup_type,
        status="completed",
    ).order_by("-created_at")[keep_count:]

    for record in old_records:
        path = Path(record.file_path) if record.file_path else None
        if path and path.exists():
            path.unlink()
        record.delete()


def create_scheduled_backup(backup_type: str) -> dict:
    if backup_type not in {"daily", "weekly", "monthly"}:
        raise ValueError("Unsupported scheduled backup type.")
    if not is_schedule_enabled(backup_type):
        return {"skipped": True, "backup_type": backup_type}

    record = create_backup(backup_type=backup_type)
    if record.status == "completed":
        prune_old_backups(backup_type)
    return {"skipped": False, "backup_type": backup_type, "record_id": record.id, "status": record.status}


def _validate_backup_file(record: BackupRecord) -> Path:
    if record.status not in {"completed", "restored"}:
        raise ValueError("Only completed backups can be restored.")

    path = Path(record.file_path)
    if not path.exists():
        raise FileNotFoundError("Backup file is missing.")

    checksum = _calculate_sha256(path)
    if record.checksum and checksum != record.checksum:
        raise ValueError("Backup checksum does not match.")

    return path


def _restore_media_from_zip(zip_file: zipfile.ZipFile):
    media_root = Path(settings.MEDIA_ROOT)
    media_root.mkdir(parents=True, exist_ok=True)
    media_root_resolved = media_root.resolve()

    if media_root.exists():
        for child in media_root.iterdir():
            if child.is_dir():
                shutil.rmtree(child)
            else:
                child.unlink()

    for member in zip_file.infolist():
        if not member.filename.startswith(f"{MEDIA_PREFIX}/") or member.is_dir():
            continue
        relative = Path(member.filename).relative_to(MEDIA_PREFIX)
        target = media_root / relative
        if not target.resolve().is_relative_to(media_root_resolved):
            raise ValueError("Backup contains an unsafe media path.")
        target.parent.mkdir(parents=True, exist_ok=True)
        with zip_file.open(member) as source, target.open("wb") as destination:
            shutil.copyfileobj(source, destination)


def restore_backup(record: BackupRecord, *, user=None) -> BackupRecord:
    backup_path = _validate_backup_file(record)
    create_backup(backup_type="pre_restore", user=user)

    try:
        with tempfile.TemporaryDirectory() as temp_dir:
            temp_path = Path(temp_dir)
            with zipfile.ZipFile(backup_path, "r") as zip_file:
                zip_file.extract(DATA_FILENAME, temp_path)
                with transaction.atomic():
                    call_command("loaddata", str(temp_path / DATA_FILENAME), verbosity=0)
                _restore_media_from_zip(zip_file)

        record.status = "restored"
        record.restored_by = user if getattr(user, "is_authenticated", False) else None
        record.restored_at = timezone.now()
        record.error_message = ""
        record.save(update_fields=["status", "restored_by", "restored_at", "error_message", "updated_at"])
    except Exception as exc:
        record.error_message = str(exc)
        record.save(update_fields=["error_message", "updated_at"])
        raise

    return record


def get_backup_overview() -> dict:
    records = BackupRecord.objects.select_related("created_by", "restored_by").all()
    latest = records.first()
    return {
        "settings": get_runtime_section_payload("backup_restore"),
        "last_backup": latest,
        "history": records[:50],
    }
