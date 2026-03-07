from django.contrib import admin

from reports.models import ReportExportJob


@admin.register(ReportExportJob)
class ReportExportJobAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "owner",
        "report_type",
        "file_format",
        "status",
        "created_at",
        "completed_at",
    )
    list_filter = ("report_type", "file_format", "status")
    search_fields = ("owner__username", "owner__email", "id")
