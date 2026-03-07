import csv
import io
import json
from datetime import timedelta

from django.core.files.base import ContentFile
from django.utils import timezone

from reports.models import ReportExportJob
from reports.serializers import ReportFiltersSerializer
from reports.services import (
    build_donation_analytics,
    build_emergency_analysis,
    build_geographic_distance,
    build_hospital_performance,
    build_request_analytics,
    build_system_performance,
)

REPORT_BUILDERS = {
    "request_analytics": build_request_analytics,
    "donation_analytics": build_donation_analytics,
    "hospital_performance": build_hospital_performance,
    "emergency_analysis": build_emergency_analysis,
    "geographic_distance": build_geographic_distance,
    "system_performance": build_system_performance,
}


def build_report_payload(report_type: str, filters: dict):
    builder = REPORT_BUILDERS[report_type]
    serializer = ReportFiltersSerializer(data=filters or {})
    serializer.is_valid(raise_exception=True)
    return builder(serializer.validated_data)


def _flatten_payload(prefix: str, payload, rows: list[dict]):
    if isinstance(payload, dict):
        for key, value in payload.items():
            next_prefix = f"{prefix}.{key}" if prefix else key
            _flatten_payload(next_prefix, value, rows)
        return
    if isinstance(payload, list):
        if payload and all(isinstance(item, dict) for item in payload):
            for index, item in enumerate(payload):
                _flatten_payload(f"{prefix}[{index}]", item, rows)
            if not payload:
                rows.append({"section": prefix, "value": "[]"})
            return
        rows.append({"section": prefix, "value": json.dumps(payload, default=str)})
        return

    rows.append({"section": prefix, "value": payload})


def _to_csv_bytes(payload: dict) -> tuple[bytes, int]:
    rows = []
    _flatten_payload("", payload, rows)

    buffer = io.StringIO()
    writer = csv.DictWriter(buffer, fieldnames=["section", "value"])
    writer.writeheader()
    for row in rows:
        writer.writerow(row)

    return buffer.getvalue().encode("utf-8"), len(rows)


def _escape_pdf_text(value: str):
    return value.replace("\\", "\\\\").replace("(", "\\(").replace(")", "\\)")


def _to_pdf_bytes(payload: dict) -> tuple[bytes, int]:
    rows = []
    _flatten_payload("", payload, rows)

    lines = ["Blood Donation System Report Export", ""]
    for row in rows[:200]:
        lines.append(f"{row['section']}: {row['value']}")

    text_commands = ["BT", "/F1 10 Tf", "50 760 Td", "14 TL"]
    for line in lines:
        text_commands.append(f"({_escape_pdf_text(str(line))}) Tj")
        text_commands.append("T*")
    text_commands.append("ET")

    stream_data = "\n".join(text_commands).encode("latin-1", errors="replace")

    objects = []
    objects.append(b"1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n")
    objects.append(b"2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n")
    objects.append(
        b"3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n"
    )
    objects.append(b"4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n")
    objects.append(
        b"5 0 obj\n<< /Length " + str(len(stream_data)).encode("ascii") + b" >>\nstream\n" + stream_data + b"\nendstream\nendobj\n"
    )

    output = io.BytesIO()
    output.write(b"%PDF-1.4\n")
    offsets = [0]
    for obj in objects:
        offsets.append(output.tell())
        output.write(obj)

    xref_pos = output.tell()
    output.write(f"xref\n0 {len(objects) + 1}\n".encode("ascii"))
    output.write(b"0000000000 65535 f \n")
    for offset in offsets[1:]:
        output.write(f"{offset:010d} 00000 n \n".encode("ascii"))

    output.write(
        (
            "trailer\n"
            f"<< /Size {len(objects) + 1} /Root 1 0 R >>\n"
            "startxref\n"
            f"{xref_pos}\n"
            "%%EOF"
        ).encode("ascii")
    )

    return output.getvalue(), len(rows)


def generate_export_artifact(job: ReportExportJob):
    payload = build_report_payload(job.report_type, job.filters or {})
    if job.file_format == "csv":
        file_bytes, row_count = _to_csv_bytes(payload)
    else:
        file_bytes, row_count = _to_pdf_bytes(payload)

    filename = f"report_export_{job.id}.{job.file_format}"
    job.artifact.save(filename, ContentFile(file_bytes), save=False)
    job.row_count = row_count
    job.completed_at = timezone.now()
    job.expires_at = timezone.now() + timedelta(days=7)
    job.status = "completed"
    job.error_message = None
    job.save(
        update_fields=[
            "artifact",
            "row_count",
            "completed_at",
            "expires_at",
            "status",
            "error_message",
            "updated_at",
        ]
    )


def cleanup_expired_exports(days: int = 7):
    threshold = timezone.now() - timedelta(days=days)
    queryset = ReportExportJob.objects.filter(
        status="completed",
        completed_at__lt=threshold,
    ).exclude(artifact="")

    updated = 0
    for job in queryset:
        if job.artifact:
            job.artifact.delete(save=False)
        job.status = "expired"
        job.save(update_fields=["status", "updated_at"])
        updated += 1
    return updated
