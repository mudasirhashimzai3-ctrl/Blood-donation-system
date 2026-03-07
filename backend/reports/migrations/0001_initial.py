# Generated manually for reports app.

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="ReportExportJob",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                ("updated_at", models.DateTimeField(auto_now=True, db_index=True)),
                ("deleted_at", models.DateTimeField(blank=True, db_index=True, null=True)),
                (
                    "report_type",
                    models.CharField(
                        choices=[
                            ("request_analytics", "Request Analytics"),
                            ("donation_analytics", "Donation Analytics"),
                            ("hospital_performance", "Hospital Performance"),
                            ("emergency_analysis", "Emergency Analysis"),
                            ("geographic_distance", "Geographic Distance"),
                            ("system_performance", "System Performance"),
                        ],
                        max_length=64,
                    ),
                ),
                ("file_format", models.CharField(choices=[("csv", "CSV"), ("pdf", "PDF")], max_length=10)),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("queued", "Queued"),
                            ("processing", "Processing"),
                            ("completed", "Completed"),
                            ("failed", "Failed"),
                            ("expired", "Expired"),
                        ],
                        default="queued",
                        max_length=20,
                    ),
                ),
                ("filters", models.JSONField(blank=True, default=dict)),
                ("include_sections", models.JSONField(blank=True, default=list)),
                ("artifact", models.FileField(blank=True, null=True, upload_to="reports/exports/")),
                ("error_message", models.TextField(blank=True, null=True)),
                ("started_at", models.DateTimeField(blank=True, null=True)),
                ("completed_at", models.DateTimeField(blank=True, null=True)),
                ("expires_at", models.DateTimeField(blank=True, null=True)),
                ("row_count", models.PositiveIntegerField(blank=True, null=True)),
                (
                    "owner",
                    models.ForeignKey(
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="report_export_jobs",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "db_table": "report_export_jobs",
            },
        ),
        migrations.AddIndex(
            model_name="reportexportjob",
            index=models.Index(fields=["owner", "created_at"], name="report_expo_owner_i_ce7d7b_idx"),
        ),
        migrations.AddIndex(
            model_name="reportexportjob",
            index=models.Index(fields=["status", "created_at"], name="report_expo_status__1b8e6a_idx"),
        ),
        migrations.AddIndex(
            model_name="reportexportjob",
            index=models.Index(fields=["report_type", "created_at"], name="report_expo_report__4fcd69_idx"),
        ),
        migrations.AddIndex(
            model_name="reportexportjob",
            index=models.Index(fields=["expires_at"], name="report_expo_expires_8f66af_idx"),
        ),
    ]
