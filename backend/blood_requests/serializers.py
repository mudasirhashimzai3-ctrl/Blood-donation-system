from datetime import timedelta

from django.utils import timezone
from rest_framework import serializers

from accounts.models import normalize_role_name
from recipients.models import Recipient

from .models import ALLOWED_UNITS_NEEDED, BloodRequest, BloodRequestNotification


class BloodRequestListSerializer(serializers.ModelSerializer):
    units_needed = serializers.DecimalField(max_digits=2, decimal_places=1, coerce_to_string=False)
    recipient_name = serializers.CharField(source="recipient.full_name", read_only=True)
    hospital_name = serializers.CharField(source="hospital.name", read_only=True)
    assigned_donor_name = serializers.SerializerMethodField()
    nearby_donors_count_dynamic = serializers.SerializerMethodField()
    estimated_time_dynamic = serializers.SerializerMethodField()
    distance_dynamic = serializers.SerializerMethodField()

    class Meta:
        model = BloodRequest
        fields = [
            "id",
            "recipient",
            "recipient_name",
            "hospital",
            "hospital_name",
            "blood_group",
            "units_needed",
            "request_type",
            "status",
            "is_verified",
            "is_emergency",
            "response_deadline",
            "nearby_donors_count",
            "total_notified_donors",
            "nearby_donors_count_dynamic",
            "estimated_time_dynamic",
            "distance_dynamic",
            "assigned_donor",
            "assigned_donor_name",
            "created_at",
        ]

    def get_assigned_donor_name(self, obj):
        if not obj.assigned_donor:
            return None
        return str(obj.assigned_donor)

    def get_nearby_donors_count_dynamic(self, obj):
        from donations.models import Donation

        return Donation.objects.filter(
            request=obj,
            deleted_at__isnull=True,
            status__in=Donation.PRIMARY_ACTIVE_STATUSES,
        ).count()

    def get_estimated_time_dynamic(self, obj):
        from donations.models import Donation

        best = (
            Donation.objects.filter(
                request=obj,
                deleted_at__isnull=True,
                status__in=Donation.PRIMARY_ACTIVE_STATUSES,
                estimated_arrival_time__isnull=False,
            )
            .order_by("estimated_arrival_time")
            .first()
        )
        return best.estimated_arrival_time if best else None

    def get_distance_dynamic(self, obj):
        from donations.models import Donation

        closest = (
            Donation.objects.filter(
                request=obj,
                deleted_at__isnull=True,
                status__in=Donation.PRIMARY_ACTIVE_STATUSES,
            )
            .order_by("distance_km")
            .first()
        )
        return closest.distance_km if closest else None


class BloodRequestDetailSerializer(serializers.ModelSerializer):
    units_needed = serializers.DecimalField(max_digits=2, decimal_places=1, coerce_to_string=False)
    recipient_name = serializers.CharField(source="recipient.full_name", read_only=True)
    recipient_phone = serializers.CharField(source="recipient.phone", read_only=True)
    hospital_name = serializers.CharField(source="hospital.name", read_only=True)
    hospital_city = serializers.CharField(source="hospital.city", read_only=True)
    assigned_donor_name = serializers.SerializerMethodField()
    attachments = serializers.SerializerMethodField()
    medical_report_url = serializers.SerializerMethodField()
    prescription_image_url = serializers.SerializerMethodField()
    emergency_proof_url = serializers.SerializerMethodField()
    nearby_donors_count_dynamic = serializers.SerializerMethodField()
    estimated_time_dynamic = serializers.SerializerMethodField()
    distance_dynamic = serializers.SerializerMethodField()

    class Meta:
        model = BloodRequest
        fields = [
            "id",
            "recipient",
            "recipient_name",
            "recipient_phone",
            "hospital",
            "hospital_name",
            "hospital_city",
            "blood_group",
            "units_needed",
            "request_type",
            "estimated_time_to_fulfill",
            "nearby_donors_count",
            "total_notified_donors",
            "nearby_donors_count_dynamic",
            "estimated_time_dynamic",
            "distance_dynamic",
            "assigned_donor",
            "assigned_donor_name",
            "auto_match_enabled",
            "location_lat",
            "location_lon",
            "status",
            "is_active",
            "rejection_reason",
            "cancelled_by",
            "is_verified",
            "is_emergency",
            "response_deadline",
            "matched_at",
            "completed_at",
            "cancelled_at",
            "medical_report",
            "prescription_image",
            "emergency_proof",
            "medical_report_url",
            "prescription_image_url",
            "emergency_proof_url",
            "attachments",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "estimated_time_to_fulfill",
            "nearby_donors_count",
            "total_notified_donors",
            "assigned_donor_name",
            "matched_at",
            "completed_at",
            "cancelled_at",
            "created_at",
            "updated_at",
            "medical_report_url",
            "prescription_image_url",
            "emergency_proof_url",
            "attachments",
        ]

    def get_assigned_donor_name(self, obj):
        if not obj.assigned_donor:
            return None
        return str(obj.assigned_donor)

    def _build_file_url(self, file_field):
        if not file_field:
            return None
        request = self.context.get("request")
        url = file_field.url
        return request.build_absolute_uri(url) if request else url

    def get_medical_report_url(self, obj):
        return self._build_file_url(obj.medical_report)

    def get_prescription_image_url(self, obj):
        return self._build_file_url(obj.prescription_image)

    def get_emergency_proof_url(self, obj):
        return self._build_file_url(obj.emergency_proof)

    def get_attachments(self, obj):
        attachments = []
        for label, file_value in [
            ("medical_report", obj.medical_report),
            ("prescription_image", obj.prescription_image),
            ("emergency_proof", obj.emergency_proof),
        ]:
            if file_value:
                attachments.append({"type": label, "url": self._build_file_url(file_value)})
        return attachments

    def get_nearby_donors_count_dynamic(self, obj):
        from donations.models import Donation

        return Donation.objects.filter(
            request=obj,
            deleted_at__isnull=True,
            status__in=Donation.PRIMARY_ACTIVE_STATUSES,
        ).count()

    def get_estimated_time_dynamic(self, obj):
        from donations.models import Donation

        best = (
            Donation.objects.filter(
                request=obj,
                deleted_at__isnull=True,
                status__in=Donation.PRIMARY_ACTIVE_STATUSES,
                estimated_arrival_time__isnull=False,
            )
            .order_by("estimated_arrival_time")
            .first()
        )
        return best.estimated_arrival_time if best else None

    def get_distance_dynamic(self, obj):
        from donations.models import Donation

        closest = (
            Donation.objects.filter(
                request=obj,
                deleted_at__isnull=True,
                status__in=Donation.PRIMARY_ACTIVE_STATUSES,
            )
            .order_by("distance_km")
            .first()
        )
        return closest.distance_km if closest else None


class BloodRequestWriteSerializer(serializers.ModelSerializer):
    units_needed = serializers.DecimalField(max_digits=2, decimal_places=1, coerce_to_string=False)
    recipient = serializers.PrimaryKeyRelatedField(
        queryset=Recipient.objects.filter(deleted_at__isnull=True),
        required=False,
        write_only=True,
    )

    class Meta:
        model = BloodRequest
        fields = [
            "id",
            "recipient",
            "hospital",
            "blood_group",
            "units_needed",
            "request_type",
            "auto_match_enabled",
            "location_lat",
            "location_lon",
            "is_active",
            "is_verified",
            "is_emergency",
            "response_deadline",
            "medical_report",
            "prescription_image",
            "emergency_proof",
        ]
        read_only_fields = ["id"]
        extra_kwargs = {
            "hospital": {"required": True},
            "blood_group": {"required": True},
            "units_needed": {"required": True},
            "request_type": {"required": True},
            "location_lat": {"required": False},
            "location_lon": {"required": False},
        }

    def validate_units_needed(self, value):
        if value not in ALLOWED_UNITS_NEEDED:
            raise serializers.ValidationError("Units needed must be 1, 1.5, or 2.")
        return value

    def validate(self, attrs):
        attrs = super().validate(attrs)
        request = self.context.get("request")
        user = getattr(request, "user", None)
        role_name = normalize_role_name(getattr(user, "role_name", None))

        supplied_recipient = attrs.get("recipient")
        if self.instance is None:
            if role_name == "admin" and supplied_recipient is None:
                raise serializers.ValidationError({"recipient": "Recipient is required for admin-created requests."})
            if role_name == "recipient" and supplied_recipient is not None:
                raise serializers.ValidationError({"recipient": "Recipient cannot be set manually."})
        elif supplied_recipient is not None and role_name != "admin":
            raise serializers.ValidationError({"recipient": "Only admins can change recipient."})

        # Verification is now automatic and always true.
        attrs.pop("is_verified", None)
        attrs["is_verified"] = True

        latitude = attrs.get("location_lat", getattr(self.instance, "location_lat", None))
        longitude = attrs.get("location_lon", getattr(self.instance, "location_lon", None))
        response_deadline = attrs.get("response_deadline", getattr(self.instance, "response_deadline", None))
        request_type = attrs.get("request_type", getattr(self.instance, "request_type", "normal"))
        hospital = attrs.get("hospital", getattr(self.instance, "hospital", None))

        errors = {}

        if latitude is None and hospital and hospital.latitude is not None:
            attrs["location_lat"] = hospital.latitude
            latitude = attrs["location_lat"]
        if longitude is None and hospital and hospital.longitude is not None:
            attrs["location_lon"] = hospital.longitude
            longitude = attrs["location_lon"]

        auto_match_enabled = attrs.get("auto_match_enabled", getattr(self.instance, "auto_match_enabled", True))
        if auto_match_enabled and hospital and (hospital.latitude is None or hospital.longitude is None):
            errors["hospital"] = "Selected hospital does not have coordinates configured for auto matching."

        if latitude is None:
            errors["location_lat"] = "Latitude is required."
        if longitude is None:
            errors["location_lon"] = "Longitude is required."
        if latitude is not None and (latitude < -90 or latitude > 90):
            errors["location_lat"] = "Latitude must be between -90 and 90."
        if longitude is not None and (longitude < -180 or longitude > 180):
            errors["location_lon"] = "Longitude must be between -180 and 180."
        if response_deadline and response_deadline <= timezone.now():
            errors["response_deadline"] = "Response deadline must be in the future."

        attrs["is_emergency"] = request_type != "normal"

        if not response_deadline:
            eta_map = {"normal": 360, "urgent": 180, "critical": 60}
            attrs["response_deadline"] = timezone.now() + timedelta(minutes=eta_map.get(request_type, 360))

        if errors:
            raise serializers.ValidationError(errors)
        return attrs


class BloodRequestRecipientOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Recipient
        fields = ["id", "full_name", "phone", "required_blood_group"]


class BloodRequestNotificationSerializer(serializers.ModelSerializer):
    donor_name = serializers.SerializerMethodField()
    donor_phone = serializers.CharField(source="donor.phone", read_only=True)

    class Meta:
        model = BloodRequestNotification
        fields = [
            "id",
            "donor",
            "donor_name",
            "donor_phone",
            "distance_km",
            "channel",
            "delivery_status",
            "response_status",
            "queued_at",
            "sent_at",
            "responded_at",
            "failure_reason",
            "created_at",
            "updated_at",
        ]

    def get_donor_name(self, obj):
        return str(obj.donor)


class CancelBloodRequestSerializer(serializers.Serializer):
    cancelled_by = serializers.ChoiceField(choices=BloodRequest.CANCELLED_BY_CHOICES)
    rejection_reason = serializers.CharField(required=False, allow_blank=True, allow_null=True)


class VerifyBloodRequestSerializer(serializers.Serializer):
    is_verified = serializers.BooleanField()
