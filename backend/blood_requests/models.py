from django.db import models
from django.db.models import Q

from core.base_models import BaseModel
from donors.models import Donor
from hospitals.models import Hospital
from recipients.models import Recipient

from .image_path import (
    blood_request_emergency_proof_upload_path,
    blood_request_medical_report_upload_path,
    blood_request_prescription_image_upload_path,
)


class BloodRequest(BaseModel):
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

    REQUEST_TYPE_CHOICES = [
        ("normal", "Normal"),
        ("urgent", "Urgent"),
        ("critical", "Critical"),
    ]

    PRIORITY_CHOICES = [
        ("low", "Low"),
        ("medium", "Medium"),
        ("high", "High"),
        ("critical", "Critical"),
    ]

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("matched", "Matched"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
    ]

    CANCELLED_BY_CHOICES = [
        ("admin", "Admin"),
        ("recipient", "Recipient"),
    ]

    recipient = models.ForeignKey(Recipient, on_delete=models.PROTECT, related_name="blood_requests")
    hospital = models.ForeignKey(Hospital, on_delete=models.PROTECT, related_name="blood_requests")
    blood_group = models.CharField(max_length=3, choices=BLOOD_GROUP_CHOICES)
    units_needed = models.PositiveSmallIntegerField()
    request_type = models.CharField(max_length=20, choices=REQUEST_TYPE_CHOICES, default="normal")
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default="medium")
    estimated_time_to_fulfill = models.PositiveIntegerField(null=True, blank=True)
    nearby_donors_count = models.PositiveIntegerField(default=0)
    total_notified_donors = models.PositiveIntegerField(default=0)
    assigned_donor = models.ForeignKey(
        Donor,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assigned_blood_requests",
    )
    auto_match_enabled = models.BooleanField(default=True)
    location_lat = models.DecimalField(max_digits=9, decimal_places=6)
    location_lon = models.DecimalField(max_digits=9, decimal_places=6)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    is_active = models.BooleanField(default=True)
    rejection_reason = models.TextField(null=True, blank=True)
    cancelled_by = models.CharField(max_length=20, choices=CANCELLED_BY_CHOICES, null=True, blank=True)
    is_verified = models.BooleanField(default=False)
    is_emergency = models.BooleanField(default=False)
    response_deadline = models.DateTimeField(null=True, blank=True)
    matched_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    medical_report = models.FileField(upload_to=blood_request_medical_report_upload_path, null=True, blank=True)
    prescription_image = models.ImageField(upload_to=blood_request_prescription_image_upload_path, null=True, blank=True)
    emergency_proof = models.FileField(upload_to=blood_request_emergency_proof_upload_path, null=True, blank=True)

    class Meta:
        db_table = "blood_requests"
        indexes = [
            models.Index(fields=["status"]),
            models.Index(fields=["blood_group"]),
            models.Index(fields=["priority"]),
            models.Index(fields=["request_type"]),
            models.Index(fields=["response_deadline"]),
            models.Index(fields=["is_active"]),
            models.Index(fields=["is_emergency"]),
            models.Index(fields=["hospital"]),
            models.Index(fields=["recipient"]),
            models.Index(fields=["assigned_donor"]),
            models.Index(fields=["status", "is_active", "response_deadline"], name="blood_req_stat_dead_idx"),
        ]
        constraints = [
             models.CheckConstraint(condition=Q(units_needed__gte=1), name="blood_request_units_min_one"),
         ]

    def __str__(self):
        return f"BloodRequest #{self.pk} ({self.blood_group}, {self.status})"


class BloodRequestNotification(BaseModel):
    CHANNEL_CHOICES = [
        ("in_app", "In App"),
        ("sms", "SMS"),
        ("email", "Email"),
    ]

    DELIVERY_STATUS_CHOICES = [
        ("queued", "Queued"),
        ("sent", "Sent"),
        ("failed", "Failed"),
    ]

    RESPONSE_STATUS_CHOICES = [
        ("pending", "Pending"),
        ("accepted", "Accepted"),
        ("declined", "Declined"),
        ("expired", "Expired"),
    ]

    blood_request = models.ForeignKey(BloodRequest, on_delete=models.CASCADE, related_name="notifications")
    donor = models.ForeignKey(Donor, on_delete=models.CASCADE, related_name="blood_request_notifications")
    distance_km = models.DecimalField(max_digits=6, decimal_places=2)
    channel = models.CharField(max_length=20, choices=CHANNEL_CHOICES, default="in_app")
    delivery_status = models.CharField(max_length=20, choices=DELIVERY_STATUS_CHOICES, default="queued")
    response_status = models.CharField(max_length=20, choices=RESPONSE_STATUS_CHOICES, default="pending")
    queued_at = models.DateTimeField(null=True, blank=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    responded_at = models.DateTimeField(null=True, blank=True)
    failure_reason = models.TextField(null=True, blank=True)

    class Meta:
        db_table = "blood_request_notifications"
        indexes = [
            models.Index(fields=["blood_request"]),
            models.Index(fields=["donor"]),
            models.Index(fields=["channel"]),
            models.Index(fields=["delivery_status"]),
            models.Index(fields=["response_status"]),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["blood_request", "donor", "channel"],
                condition=Q(deleted_at__isnull=True),
                name="uniq_blood_request_donor_channel_active",
            ),
        ]

    def __str__(self):
        return f"BloodRequestNotification #{self.pk} ({self.channel})"
