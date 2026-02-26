from django.contrib import admin

from .models import Hospital


@admin.register(Hospital)
class HospitalAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "city", "phone", "email", "is_active")
    list_filter = ("city", "is_active")
    search_fields = ("name", "city", "phone", "email", "address")

