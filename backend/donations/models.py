from django.db import models
from django.db.models import Q

from core.base_models import BaseModel


class Donation(BaseModel):
    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("accepted", "Accepted"),
        ("en_route", "En Route"),
        ("arrived", "Arrived"),
        ("completed", "Completed"),
        ("cancelled", "Cancelled"),
        ("declined", "Declined"),
        ("expired", "Expired"),
    ]

    PRIMARY_ACTIVE_STATUSES = ("pending", "accepted")

    request = models.ForeignKey(
        "blood_requests.BloodRequest",
        on_delete=models.CASCADE,
        related_name="donations",
    )
    donor = models.ForeignKey(
        "donors.Donor",
        on_delete=models.CASCADE,
        related_name="donations",
    )
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    response_time = models.PositiveIntegerField(null=True, blank=True)
    distance_km = models.DecimalField(max_digits=6, decimal_places=2)
    estimated_arrival_time = models.PositiveIntegerField(null=True, blank=True)
    is_primary = models.BooleanField(default=False)
    notified_at = models.DateTimeField(null=True, blank=True)
    reminder_sent_at = models.DateTimeField(null=True, blank=True)
    cancellation_reason = models.TextField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    responded_at = models.DateTimeField(null=True, blank=True)
    reminder_count = models.PositiveSmallIntegerField(default=0)

    class Meta:
        db_table = "donations"
        indexes = [
            models.Index(fields=["request"]),
            models.Index(fields=["donor"]),
            models.Index(fields=["status"]),
            models.Index(fields=["is_primary"]),
            models.Index(fields=["notified_at"]),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["request", "donor"],
                condition=Q(deleted_at__isnull=True),
                name="uniq_donation_request_donor_active",
            ),
            models.UniqueConstraint(
                fields=["request"],
                condition=Q(deleted_at__isnull=True, is_primary=True)
                & Q(status__in=("pending", "accepted")),
                name="uniq_primary_donation_request_active",
            ),
        ]

    def __str__(self):
        return f"Donation #{self.pk} req={self.request_id} donor={self.donor_id} ({self.status})"
