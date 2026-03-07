from django.db import models

from core.base_models import BaseModel


class ReportExportJob(BaseModel):
    REPORT_TYPE_CHOICES = [
        ("request_analytics", "Request Analytics"),
        ("donation_analytics", "Donation Analytics"),
        ("hospital_performance", "Hospital Performance"),
        ("emergency_analysis", "Emergency Analysis"),
        ("geographic_distance", "Geographic Distance"),
        ("system_performance", "System Performance"),
    ]

    FILE_FORMAT_CHOICES = [
        ("csv", "CSV"),
        ("pdf", "PDF"),
    ]

    STATUS_CHOICES = [
        ("queued", "Queued"),
        ("processing", "Processing"),
        ("completed", "Completed"),
        ("failed", "Failed"),
        ("expired", "Expired"),
    ]

    owner = models.ForeignKey(
        "accounts.User",
        on_delete=models.CASCADE,
        related_name="report_export_jobs",
    )
    report_type = models.CharField(max_length=64, choices=REPORT_TYPE_CHOICES)
    file_format = models.CharField(max_length=10, choices=FILE_FORMAT_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="queued")
    filters = models.JSONField(default=dict, blank=True)
    include_sections = models.JSONField(default=list, blank=True)
    artifact = models.FileField(upload_to="reports/exports/", null=True, blank=True)
    error_message = models.TextField(null=True, blank=True)
    started_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    row_count = models.PositiveIntegerField(null=True, blank=True)

    class Meta:
        db_table = "report_export_jobs"
        indexes = [
            models.Index(fields=["owner", "created_at"]),
            models.Index(fields=["status", "created_at"]),
            models.Index(fields=["report_type", "created_at"]),
            models.Index(fields=["expires_at"]),
        ]

    def __str__(self):
        return f"ReportExportJob #{self.pk} ({self.report_type}, {self.file_format}, {self.status})"
