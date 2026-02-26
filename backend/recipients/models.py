from django.db import models
from django.db.models import Q

from core.base_models import BaseModel


class Hospital(BaseModel):
    name = models.CharField(max_length=200)
    contact_phone = models.CharField(max_length=20, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    city = models.CharField(max_length=100)
    latitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    longitude = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)

    class Meta:
        db_table = "hospitals"
        indexes = [
            models.Index(fields=["name"]),
            models.Index(fields=["city"]),
            models.Index(fields=["contact_phone"]),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["name", "city"],
                condition=Q(deleted_at__isnull=True),
                name="uniq_hospitals_name_city_active",
            ),
        ]

    def __str__(self):
        return self.name


class Recipient(BaseModel):
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
        ("pending", "Pending"),
        ("active", "Active"),
        ("blocked", "Blocked"),
    ]

    EMERGENCY_LEVEL_CHOICES = [
        ("normal", "Normal"),
        ("urgent", "Urgent"),
        ("critical", "Critical"),
    ]

    GENDER_CHOICES = [
        ("male", "Male"),
        ("female", "Female"),
        ("other", "Other"),
    ]

    full_name = models.CharField(max_length=200)
    email = models.EmailField(null=True, blank=True)
    phone = models.CharField(max_length=20)
    required_blood_group = models.CharField(max_length=3, choices=BLOOD_GROUP_CHOICES)
    age = models.PositiveSmallIntegerField()
    gender = models.CharField(max_length=10, choices=GENDER_CHOICES)
    hospital = models.ForeignKey(Hospital, on_delete=models.PROTECT, related_name="recipients")
    emergency_level = models.CharField(max_length=20, choices=EMERGENCY_LEVEL_CHOICES, default="normal")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")

    class Meta:
        db_table = "recipients"
        indexes = [
            models.Index(fields=["status"]),
            models.Index(fields=["required_blood_group"]),
            models.Index(fields=["emergency_level"]),
            models.Index(fields=["full_name"]),
            models.Index(fields=["phone"]),
            models.Index(fields=["hospital"]),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["phone"],
                condition=Q(deleted_at__isnull=True),
                name="uniq_recipients_phone_active",
            ),
            models.UniqueConstraint(
                fields=["email"],
                condition=Q(deleted_at__isnull=True, email__isnull=False) & ~Q(email=""),
                name="uniq_recipients_email_active",
            ),
        ]

    def __str__(self):
        return self.full_name

