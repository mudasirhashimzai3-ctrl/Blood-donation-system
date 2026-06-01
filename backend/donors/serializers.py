from django.utils import timezone
from rest_framework import serializers

from .models import Donor
from .services.eligibility import get_donor_eligibility


class DonorListSerializer(serializers.ModelSerializer):
    profile_picture_url = serializers.SerializerMethodField()
    is_eligible = serializers.SerializerMethodField()
    eligibility_status = serializers.SerializerMethodField()
    eligible_from = serializers.SerializerMethodField()
    eligibility_reason = serializers.SerializerMethodField()

    class Meta:
        model = Donor
        fields = [
            "id",
            "first_name",
            "last_name",
            "phone",
            "email",
            "blood_group",
            "status",
            "last_donation_date",
            "is_eligible",
            "eligibility_status",
            "eligible_from",
            "eligibility_reason",
            "profile_picture_url",
            "created_at",
        ]

    def get_profile_picture_url(self, obj):
        if not obj.profile_picture:
            return None
        request = self.context.get("request")
        url = obj.profile_picture.url
        return request.build_absolute_uri(url) if request else url

    def _eligibility(self, obj):
        return get_donor_eligibility(obj.last_donation_date)

    def get_is_eligible(self, obj):
        return self._eligibility(obj)["is_eligible"]

    def get_eligibility_status(self, obj):
        return self._eligibility(obj)["eligibility_status"]

    def get_eligible_from(self, obj):
        value = self._eligibility(obj)["eligible_from"]
        return value.isoformat() if value else None

    def get_eligibility_reason(self, obj):
        return self._eligibility(obj)["eligibility_reason"]


class DonorDetailSerializer(serializers.ModelSerializer):
    profile_picture_url = serializers.SerializerMethodField()
    is_eligible = serializers.SerializerMethodField()
    eligibility_status = serializers.SerializerMethodField()
    eligible_from = serializers.SerializerMethodField()
    eligibility_reason = serializers.SerializerMethodField()
    remove_profile_picture = serializers.BooleanField(write_only=True, required=False, default=False)

    class Meta:
        model = Donor
        fields = [
            "id",
            "first_name",
            "last_name",
            "phone",
            "email",
            "blood_group",
            "status",
            "age",
            "profile_picture",
            "profile_picture_url",
            "latitude",
            "longitude",
            "date_of_birth",
            "permanent_address_city",
            "local_address_city",
            "last_donation_date",
            "is_eligible",
            "eligibility_status",
            "eligible_from",
            "eligibility_reason",
            "remove_profile_picture",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "status", "created_at", "updated_at", "profile_picture_url"]

    def get_profile_picture_url(self, obj):
        if not obj.profile_picture:
            return None
        request = self.context.get("request")
        url = obj.profile_picture.url
        return request.build_absolute_uri(url) if request else url

    def _eligibility(self, obj):
        return get_donor_eligibility(obj.last_donation_date)

    def get_is_eligible(self, obj):
        return self._eligibility(obj)["is_eligible"]

    def get_eligibility_status(self, obj):
        return self._eligibility(obj)["eligibility_status"]

    def get_eligible_from(self, obj):
        value = self._eligibility(obj)["eligible_from"]
        return value.isoformat() if value else None

    def get_eligibility_reason(self, obj):
        return self._eligibility(obj)["eligibility_reason"]

    def validate_phone(self, value):
        normalized_phone = value.strip()
        queryset = Donor.all_objects.filter(phone=normalized_phone, deleted_at__isnull=True)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        if queryset.exists():
            raise serializers.ValidationError("Phone number already exists.")
        return normalized_phone

    def validate_email(self, value):
        if not value:
            return None

        normalized_email = value.strip().lower()
        queryset = Donor.all_objects.filter(email__iexact=normalized_email, deleted_at__isnull=True)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        if queryset.exists():
            raise serializers.ValidationError("Email already exists.")
        return normalized_email

    def validate_profile_picture(self, value):
        if not value:
            return value

        content_type = getattr(value, "content_type", "")
        if not content_type.startswith("image/"):
            raise serializers.ValidationError("Profile picture must be an image file.")

        max_size = 5 * 1024 * 1024
        if value.size > max_size:
            raise serializers.ValidationError("Profile picture size must be 5MB or less.")

        return value

    def validate_age(self, value):
        if value is None:
            return value
        if value <= 18:
            raise serializers.ValidationError("Donor age must be greater than 18.")
        return value

    def validate(self, attrs):
        attrs = super().validate(attrs)
        today = timezone.localdate()
        errors = {}

        date_of_birth = attrs.get("date_of_birth", getattr(self.instance, "date_of_birth", None))
        last_donation_date = attrs.get(
            "last_donation_date",
            getattr(self.instance, "last_donation_date", None),
        )

        if date_of_birth and date_of_birth > today:
            errors["date_of_birth"] = "Date of birth cannot be in the future."

        if last_donation_date and last_donation_date > today:
            errors["last_donation_date"] = "Last donation date cannot be in the future."

        latitude = attrs.get("latitude", getattr(self.instance, "latitude", None))
        longitude = attrs.get("longitude", getattr(self.instance, "longitude", None))
        if latitude is not None and (latitude < -90 or latitude > 90):
            errors["latitude"] = "Latitude must be between -90 and 90."
        if longitude is not None and (longitude < -180 or longitude > 180):
            errors["longitude"] = "Longitude must be between -180 and 180."

        if errors:
            raise serializers.ValidationError(errors)

        return attrs

    def create(self, validated_data):
        validated_data.pop("remove_profile_picture", None)
        validated_data["status"] = "active"
        return super().create(validated_data)

    def update(self, instance, validated_data):
        remove_picture = validated_data.pop("remove_profile_picture", False)
        if remove_picture and instance.profile_picture:
            instance.profile_picture.delete(save=False)
            instance.profile_picture = None
        validated_data["status"] = "active"
        return super().update(instance, validated_data)


class DonorCandidateSerializer(serializers.Serializer):
    id = serializers.IntegerField(source="donor.id")
    first_name = serializers.CharField(source="donor.first_name")
    last_name = serializers.CharField(source="donor.last_name")
    phone = serializers.CharField(source="donor.phone")
    email = serializers.EmailField(source="donor.email", allow_null=True)
    blood_group = serializers.CharField(source="donor.blood_group")
    status = serializers.CharField(source="donor.status")
    last_donation_date = serializers.DateField(source="donor.last_donation_date", allow_null=True)
    distance_km = serializers.DecimalField(max_digits=6, decimal_places=2)
    match_type = serializers.CharField()
    is_eligible = serializers.SerializerMethodField()
    eligibility_status = serializers.SerializerMethodField()
    eligible_from = serializers.SerializerMethodField()
    eligibility_reason = serializers.SerializerMethodField()

    def _eligibility(self, obj):
        return get_donor_eligibility(obj["donor"].last_donation_date)

    def get_is_eligible(self, obj):
        return self._eligibility(obj)["is_eligible"]

    def get_eligibility_status(self, obj):
        return self._eligibility(obj)["eligibility_status"]

    def get_eligible_from(self, obj):
        value = self._eligibility(obj)["eligible_from"]
        return value.isoformat() if value else None

    def get_eligibility_reason(self, obj):
        return self._eligibility(obj)["eligibility_reason"]
