from django.db import models
from django.db.models import Q

from core.base_models import BaseModel
from .image_path import donor_profile_picture_upload_path


class Donor(BaseModel):
    BLOOD_GROUP_CHOICES = [
        ("A+", "A+"),
        ("A-", "A-"),
        ("B+", "B+"),
        ("B-", "B-"),
        ("AB+", "AB+"),
        ("AB-", "AB-"),
        ("O+", "O+"),
        ("O-", "O-"),
    ]

    STATUS_CHOICES = [
        ("active", "Active"),
        ("blocked", "Blocked"),
        ("pending", "Pending"),
    ]

    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    phone = models.CharField(max_length=20)
    email = models.EmailField(null=True, blank=True)
    blood_group = models.CharField(max_length=3, choices=BLOOD_GROUP_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    profile_picture = models.ImageField(
        upload_to=donor_profile_picture_upload_path,
        null=True,
        blank=True,
    )
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    emergency_contact_name = models.CharField(max_length=150, null=True, blank=True)
    emergency_contact_phone = models.CharField(max_length=20, null=True, blank=True)
    last_donation_date = models.DateField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True)

    class Meta:
        db_table = "donors"
        indexes = [
            models.Index(fields=["status"]),
            models.Index(fields=["blood_group"]),
            models.Index(fields=["last_name"]),
            models.Index(fields=["phone"]),
            models.Index(fields=["emergency_contact_phone"], name="donors_emergency_phone_idx"),
            models.Index(fields=["latitude"]),
            models.Index(fields=["longitude"]),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["phone"],
                condition=Q(deleted_at__isnull=True),
                name="uniq_donors_phone_active",
            ),
            models.UniqueConstraint(
                fields=["email"],
                condition=Q(deleted_at__isnull=True, email__isnull=False) & ~Q(email=""),
                name="uniq_donors_email_active",
            ),
        ]

    def __str__(self):
        return f"{self.first_name} {self.last_name}".strip()
