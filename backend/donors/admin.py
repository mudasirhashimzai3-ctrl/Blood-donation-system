from django.contrib import admin

from .models import Donor


@admin.register(Donor)
class DonorAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "first_name",
        "last_name",
        "age",
        "blood_group",
        "status",
        "phone",
    )
    list_filter = ("status", "blood_group")
    search_fields = ("first_name", "last_name", "phone", "email", "permanent_address", "local_address")
