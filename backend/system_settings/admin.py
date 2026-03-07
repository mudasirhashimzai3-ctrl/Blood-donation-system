from django.contrib import admin

from system_settings.models import SystemSettingsAuditLog


@admin.register(SystemSettingsAuditLog)
class SystemSettingsAuditLogAdmin(admin.ModelAdmin):
    list_display = ("id", "section", "changed_by", "reset_to_default", "created_at")
    list_filter = ("section", "reset_to_default", "created_at")
    search_fields = ("section", "changed_by__username", "changed_by__email")
    readonly_fields = (
        "section",
        "old_value",
        "new_value",
        "changed_by",
        "ip_address",
        "user_agent",
        "reset_to_default",
        "created_at",
        "updated_at",
    )
