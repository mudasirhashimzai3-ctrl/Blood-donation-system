from datetime import timedelta

from django.utils import timezone
from rest_framework import serializers

from donors.models import Donor

from .models import BloodRequest, BloodRequestNotification
from .services.matching import MAX_MATCH_RADIUS_KM, haversine_distance_km


class BloodRequestListSerializer(serializers.ModelSerializer):
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
            "priority",
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
            "priority",
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
    class Meta:
        model = BloodRequest
        fields = [
            "id",
            "recipient",
            "hospital",
            "blood_group",
            "units_needed",
            "request_type",
            "priority",
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

    def validate_units_needed(self, value):
        if value < 1:
            raise serializers.ValidationError("Units needed must be at least 1.")
        return value

    def validate(self, attrs):
        attrs = super().validate(attrs)

        latitude = attrs.get("location_lat", getattr(self.instance, "location_lat", None))
        longitude = attrs.get("location_lon", getattr(self.instance, "location_lon", None))
        response_deadline = attrs.get("response_deadline", getattr(self.instance, "response_deadline", None))
        request_type = attrs.get("request_type", getattr(self.instance, "request_type", "normal"))

        errors = {}

        if latitude is not None and (latitude < -90 or latitude > 90):
            errors["location_lat"] = "Latitude must be between -90 and 90."
        if longitude is not None and (longitude < -180 or longitude > 180):
            errors["location_lon"] = "Longitude must be between -180 and 180."
        if response_deadline and response_deadline <= timezone.now():
            errors["response_deadline"] = "Response deadline must be in the future."

        recipient = attrs.get("recipient", getattr(self.instance, "recipient", None))
        hospital = attrs.get("hospital", getattr(self.instance, "hospital", None))
        if recipient and hospital and recipient.hospital_id != hospital.id:
            errors["hospital"] = "Selected recipient is not linked to the selected hospital."

        if "is_emergency" not in attrs:
            attrs["is_emergency"] = request_type != "normal"

        if not response_deadline:
            eta_map = {"normal": 360, "urgent": 180, "critical": 60}
            attrs["response_deadline"] = timezone.now() + timedelta(minutes=eta_map.get(request_type, 360))

        if errors:
            raise serializers.ValidationError(errors)
        return attrs


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


class AssignDonorSerializer(serializers.Serializer):
    donor_id = serializers.IntegerField(min_value=1)

    def validate_donor_id(self, value):
        request = self.context["blood_request"]

        try:
            donor = Donor.objects.get(pk=value, deleted_at__isnull=True)
        except Donor.DoesNotExist as exc:
            raise serializers.ValidationError("Donor not found.") from exc

        if donor.status != "active":
            raise serializers.ValidationError("Only active donors can be assigned.")
        if donor.blood_group != request.blood_group:
            raise serializers.ValidationError("Donor blood group does not match the request.")
        if donor.latitude is None or donor.longitude is None:
            raise serializers.ValidationError("Donor has no coordinates set.")

        if donor.last_donation_date:
            cooldown_cutoff = timezone.localdate() - timedelta(days=56)
            if donor.last_donation_date > cooldown_cutoff:
                raise serializers.ValidationError("Donor is still in cooldown period.")

        distance_km = haversine_distance_km(
            request.location_lat,
            request.location_lon,
            donor.latitude,
            donor.longitude,
        )
        if distance_km > MAX_MATCH_RADIUS_KM:
            raise serializers.ValidationError("Donor is outside the matching radius.")

        self.context["donor"] = donor
        return value


class CancelBloodRequestSerializer(serializers.Serializer):
    cancelled_by = serializers.ChoiceField(choices=BloodRequest.CANCELLED_BY_CHOICES)
    rejection_reason = serializers.CharField(required=False, allow_blank=True, allow_null=True)


class VerifyBloodRequestSerializer(serializers.Serializer):
    is_verified = serializers.BooleanField()
