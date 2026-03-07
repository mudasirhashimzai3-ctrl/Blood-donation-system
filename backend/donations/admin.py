from django.contrib import admin

from donations.models import Donation


@admin.register(Donation)
class DonationAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "request",
        "donor",
        "status",
        "is_primary",
        "distance_km",
        "estimated_arrival_time",
        "priority_score",
        "created_at",
    )
    list_filter = ("status", "is_primary")
    search_fields = ("donor__first_name", "donor__last_name", "donor__phone")
