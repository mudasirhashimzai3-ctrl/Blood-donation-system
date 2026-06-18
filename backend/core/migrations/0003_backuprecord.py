from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("core", "0002_localization_default_timezone_kabul"),
    ]

    operations = [
        migrations.CreateModel(
            name="BackupRecord",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                (
                    "backup_type",
                    models.CharField(
                        choices=[
                            ("manual", "Manual"),
                            ("daily", "Daily"),
                            ("weekly", "Weekly"),
                            ("monthly", "Monthly"),
                            ("pre_restore", "Pre-restore"),
                        ],
                        max_length=20,
                    ),
                ),
                (
                    "status",
                    models.CharField(
                        choices=[
                            ("pending", "Pending"),
                            ("running", "Running"),
                            ("completed", "Completed"),
                            ("failed", "Failed"),
                            ("restored", "Restored"),
                        ],
                        db_index=True,
                        default="pending",
                        max_length=20,
                    ),
                ),
                ("file_path", models.CharField(blank=True, max_length=500)),
                ("file_size", models.BigIntegerField(default=0)),
                ("checksum", models.CharField(blank=True, max_length=64)),
                ("error_message", models.TextField(blank=True)),
                ("started_at", models.DateTimeField(blank=True, null=True)),
                ("finished_at", models.DateTimeField(blank=True, null=True)),
                ("restored_at", models.DateTimeField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True, db_index=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                (
                    "created_by",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="created_backups",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
                (
                    "restored_by",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.SET_NULL,
                        related_name="restored_backups",
                        to=settings.AUTH_USER_MODEL,
                    ),
                ),
            ],
            options={
                "db_table": "backup_records",
                "ordering": ["-created_at"],
            },
        ),
        migrations.AddIndex(
            model_name="backuprecord",
            index=models.Index(fields=["backup_type", "created_at"], name="backup_reco_backup__6faad6_idx"),
        ),
        migrations.AddIndex(
            model_name="backuprecord",
            index=models.Index(fields=["status", "created_at"], name="backup_reco_status_8447a1_idx"),
        ),
    ]
