from django.contrib import admin

from .models import Hospital


@admin.register(Hospital)
class HospitalAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "province", "city", "phone", "email", "is_active")
    list_filter = ("province", "is_active")
    search_fields = ("name", "province", "city", "phone", "email", "address")
