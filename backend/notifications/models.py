from django.db import models
from django.db.models import Q

from core.base_models import BaseModel


class Notification(BaseModel):
    EVENT_KEY_CHOICES = [
        ("blood_request_created", "Blood Request Created"),
        ("blood_request_verified", "Blood Request Verified"),
        ("blood_request_assigned", "Blood Request Assigned"),
        ("blood_request_completed", "Blood Request Completed"),
        ("blood_request_cancelled", "Blood Request Cancelled"),
        ("donation_status_updated", "Donation Status Updated"),
        ("donation_primary_changed", "Donation Primary Changed"),
        ("donation_reminder", "Donation Reminder"),
        ("account_locked", "Account Locked"),
        ("password_reset_code_sent", "Password Reset Code Sent"),
        ("email_verified", "Email Verified"),
        ("system_alert", "System Alert"),
    ]

    TYPE_CHOICES = [
        ("request_update", "Request Update"),
        ("donation_update", "Donation Update"),
        ("auth", "Authentication"),
        ("system", "System"),
        ("reminder", "Reminder"),
    ]

    SENT_VIA_CHOICES = [
        ("in_app", "In App"),
        ("email", "Email"),
        ("sms", "SMS"),
    ]

    STATUS_CHOICES = [
        ("queued", "Queued"),
        ("sent", "Sent"),
        ("delivered", "Delivered"),
        ("failed", "Failed"),
    ]

    PRIORITY_CHOICES = [
        ("low", "Low"),
        ("normal", "Normal"),
        ("high", "High"),
        ("critical", "Critical"),
    ]

    user = models.ForeignKey("accounts.User", on_delete=models.PROTECT, related_name="notifications")
    user_type = models.CharField(max_length=50)
    request = models.ForeignKey(
        "blood_requests.BloodRequest",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="user_notifications",
    )
    donation = models.ForeignKey(
        "donations.Donation",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="user_notifications",
    )
    event_key = models.CharField(max_length=100, choices=EVENT_KEY_CHOICES)
    type = models.CharField(max_length=50, choices=TYPE_CHOICES)
    title = models.CharField(max_length=255)
    message = models.TextField()
    sent_via = models.CharField(max_length=20, choices=SENT_VIA_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="queued")
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES, default="normal")
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    sent_at = models.DateTimeField(null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    dedupe_key = models.CharField(max_length=191, null=True, blank=True)
    error_message = models.TextField(null=True, blank=True)
    provider_message_id = models.CharField(max_length=128, null=True, blank=True)
    provider_status = models.CharField(max_length=64, null=True, blank=True)
    provider_response = models.JSONField(null=True, blank=True)
    hidden_at = models.DateTimeField(null=True, blank=True, db_index=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    delivery_attempts = models.PositiveSmallIntegerField(default=0)

    class Meta:
        db_table = "notifications"
        indexes = [
            models.Index(fields=["user", "created_at"]),
            models.Index(fields=["user", "is_read"]),
            models.Index(fields=["status"]),
            models.Index(fields=["type"]),
            models.Index(fields=["sent_via"]),
            models.Index(fields=["hidden_at"]),
            models.Index(fields=["event_key"]),
            models.Index(fields=["dedupe_key"]),
            models.Index(fields=["request"]),
            models.Index(fields=["donation"]),
        ]
        constraints = [
            models.UniqueConstraint(
                fields=["user", "sent_via", "dedupe_key"],
                condition=Q(deleted_at__isnull=True, hidden_at__isnull=True)
                & Q(dedupe_key__isnull=False)
                & ~Q(dedupe_key=""),
                name="uniq_notification_dedupe_user_channel_active",
            ),
        ]

    def __str__(self):
        return f"Notification #{self.pk} ({self.user_id}, {self.event_key}, {self.sent_via})"
