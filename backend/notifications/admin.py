from django.contrib import admin

from notifications.models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "user",
        "event_key",
        "type",
        "sent_via",
        "status",
        "is_read",
        "created_at",
    )
    list_filter = ("event_key", "type", "sent_via", "status", "is_read")
    search_fields = ("title", "message", "user__username", "user__email")
