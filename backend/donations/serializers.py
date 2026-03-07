from django.utils import timezone
from rest_framework import serializers

from donations.models import Donation
from donations.services.metrics import build_distance_eta_priority_snapshot
from donations.services.transitions import can_transition, is_terminal_status


class DonationListSerializer(serializers.ModelSerializer):
    donor_name = serializers.SerializerMethodField()
    donor_phone = serializers.CharField(source="donor.phone", read_only=True)
    request_status = serializers.CharField(source="request.status", read_only=True)
    request_response_deadline = serializers.DateTimeField(source="request.response_deadline", read_only=True)
    nearby_donors_count_dynamic = serializers.SerializerMethodField()
    estimated_time_dynamic = serializers.SerializerMethodField()
    distance_dynamic = serializers.SerializerMethodField()

    class Meta:
        model = Donation
        fields = [
            "id",
            "request",
            "donor",
            "donor_name",
            "donor_phone",
            "status",
            "response_time",
            "distance_km",
            "estimated_arrival_time",
            "is_primary",
            "notified_at",
            "reminder_sent_at",
            "priority_score",
            "request_status",
            "request_response_deadline",
            "nearby_donors_count_dynamic",
            "estimated_time_dynamic",
            "distance_dynamic",
            "created_at",
            "updated_at",
        ]

    def get_donor_name(self, obj):
        return str(obj.donor)

    def get_nearby_donors_count_dynamic(self, obj):
        return obj.request.donations.filter(
            deleted_at__isnull=True,
            status__in=Donation.PRIMARY_ACTIVE_STATUSES,
        ).count()

    def get_estimated_time_dynamic(self, obj):
        best = (
            obj.request.donations.filter(
                deleted_at__isnull=True,
                status__in=Donation.PRIMARY_ACTIVE_STATUSES,
                estimated_arrival_time__isnull=False,
            )
            .order_by("estimated_arrival_time")
            .first()
        )
        return best.estimated_arrival_time if best else None

    def get_distance_dynamic(self, obj):
        closest = (
            obj.request.donations.filter(
                deleted_at__isnull=True,
                status__in=Donation.PRIMARY_ACTIVE_STATUSES,
            )
            .order_by("distance_km")
            .first()
        )
        return closest.distance_km if closest else None


class DonationDetailSerializer(DonationListSerializer):
    request_blood_group = serializers.CharField(source="request.blood_group", read_only=True)
    request_priority = serializers.CharField(source="request.priority", read_only=True)
    request_type = serializers.CharField(source="request.request_type", read_only=True)
    recipient_name = serializers.CharField(source="request.recipient.full_name", read_only=True)
    hospital_name = serializers.CharField(source="request.hospital.name", read_only=True)

    class Meta(DonationListSerializer.Meta):
        fields = DonationListSerializer.Meta.fields + [
            "cancellation_reason",
            "notes",
            "responded_at",
            "reminder_count",
            "request_blood_group",
            "request_priority",
            "request_type",
            "recipient_name",
            "hospital_name",
        ]


class DonationStatusUpdateSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=Donation.STATUS_CHOICES)
    notes = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    cancellation_reason = serializers.CharField(required=False, allow_blank=True, allow_null=True)

    def validate(self, attrs):
        donation = self.context["donation"]
        target_status = attrs["status"]

        if is_terminal_status(donation.status) and target_status != donation.status:
            raise serializers.ValidationError("Terminal donations cannot be changed.")

        if not can_transition(donation.status, target_status):
            raise serializers.ValidationError(
                f"Invalid status transition from {donation.status} to {target_status}."
            )

        if target_status == "cancelled" and not attrs.get("cancellation_reason"):
            raise serializers.ValidationError({"cancellation_reason": "Cancellation reason is required."})

        return attrs


class DonationSetPrimarySerializer(serializers.Serializer):
    is_primary = serializers.BooleanField()

    def validate(self, attrs):
        donation = self.context["donation"]
        if attrs["is_primary"] and donation.status not in Donation.PRIMARY_ACTIVE_STATUSES:
            raise serializers.ValidationError("Only active donations can be set as primary.")
        return attrs


class DonationReminderSerializer(serializers.Serializer):
    channels = serializers.ListField(
        child=serializers.ChoiceField(choices=[("in_app", "in_app"), ("email", "email"), ("sms", "sms")]),
        required=False,
        allow_empty=True,
    )


class DonationEstimateRefreshSerializer(serializers.Serializer):
    def update_donation(self, donation):
        donor = donation.donor
        blood_request = donation.request
        if donor.latitude is None or donor.longitude is None:
            raise serializers.ValidationError({"detail": "Donor does not have coordinates configured."})

        distance_km, eta, score = build_distance_eta_priority_snapshot(
            blood_request=blood_request,
            donor=donor,
        )
        donation.distance_km = distance_km
        donation.estimated_arrival_time = eta
        donation.priority_score = score
        donation.save(update_fields=["distance_km", "estimated_arrival_time", "priority_score", "updated_at"])
        return donation


def apply_status_update(donation: Donation, *, status_value: str, notes=None, cancellation_reason=None):
    original_status = donation.status
    now = timezone.now()

    donation.status = status_value
    if notes is not None:
        donation.notes = notes
    if cancellation_reason is not None:
        donation.cancellation_reason = cancellation_reason

    if original_status == "pending" and status_value != "pending":
        donation.responded_at = donation.responded_at or now
        if donation.notified_at:
            delta = donation.responded_at - donation.notified_at
            donation.response_time = max(0, int(delta.total_seconds() // 60))

    donation.save(
        update_fields=[
            "status",
            "notes",
            "cancellation_reason",
            "responded_at",
            "response_time",
            "updated_at",
        ]
    )
    return donation
