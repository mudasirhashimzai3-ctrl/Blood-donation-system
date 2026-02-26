from django.contrib import admin

from .models import Hospital, Recipient


@admin.register(Hospital)
class HospitalAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "city", "contact_phone")
    list_filter = ("city",)
    search_fields = ("name", "city", "contact_phone", "address")


@admin.register(Recipient)
class RecipientAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "full_name",
        "phone",
        "required_blood_group",
        "hospital",
        "emergency_level",
        "status",
    )
    list_filter = ("required_blood_group", "emergency_level", "status", "hospital__city")
    search_fields = ("full_name", "phone", "email", "hospital__name")

