from django.conf import settings
from django.db import models

from core.base_models import BaseModel
from system_settings.constants import SECTIONS


class SystemSettingsAuditLog(BaseModel):
    section = models.CharField(max_length=64, choices=[(section, section) for section in SECTIONS])
    old_value = models.JSONField(default=dict, blank=True)
    new_value = models.JSONField(default=dict, blank=True)
    changed_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="system_settings_audit_logs",
    )
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    reset_to_default = models.BooleanField(default=False)

    class Meta:
        db_table = "system_settings_audit_logs"
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["section", "created_at"]),
            models.Index(fields=["changed_by", "created_at"]),
        ]

    def __str__(self):
        return f"{self.section} by {self.changed_by_id or 'system'}"
