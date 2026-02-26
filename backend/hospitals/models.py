from django.db import models
from django.db.models import Q

from core.base_models import BaseModel


class Hospital(BaseModel):
    name = models.CharField(max_length=200)
    phone = models.CharField(max_length=20, null=True, blank=True)
    email = models.EmailField(null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    city = models.CharField(max_length=100)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        db_table = "hospitals"
        indexes = [
            models.Index(fields=["name"]),
            models.Index(fields=["city"]),
            models.Index(fields=["phone"]),
            models.Index(fields=["email"]),
            models.Index(fields=["is_active"]),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["name", "city"],
                condition=Q(deleted_at__isnull=True),
                name="uniq_hospitals_name_city_active",
            ),
            models.UniqueConstraint(
                fields=["phone"],
                condition=Q(deleted_at__isnull=True, phone__isnull=False) & ~Q(phone=""),
                name="uniq_hospitals_phone_active",
            ),
            models.UniqueConstraint(
                fields=["email"],
                condition=Q(deleted_at__isnull=True, email__isnull=False) & ~Q(email=""),
                name="uniq_hospitals_email_active",
            ),
        ]

    def __str__(self):
        return self.name

