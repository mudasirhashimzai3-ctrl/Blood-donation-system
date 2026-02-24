from django.contrib import admin

from .models import Donor


@admin.register(Donor)
class DonorAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "first_name",
        "last_name",
        "blood_group",
        "status",
        "phone",
        "emergency_contact_phone",
    )
    list_filter = ("status", "blood_group")
    search_fields = ("first_name", "last_name", "phone", "email", "emergency_contact_name", "emergency_contact_phone")
