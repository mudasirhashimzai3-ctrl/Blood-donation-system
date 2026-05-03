from django.contrib import admin

from .models import Hospital


@admin.register(Hospital)
class HospitalAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "province", "city", "phone", "email")
    list_filter = ("province",)
    search_fields = ("name", "province", "city", "phone", "email", "address")
