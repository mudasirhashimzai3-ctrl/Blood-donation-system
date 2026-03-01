from django.utils import timezone
from rest_framework import serializers

from .models import Donor


class DonorListSerializer(serializers.ModelSerializer):
    profile_picture_url = serializers.SerializerMethodField()

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
            "profile_picture_url",
            "created_at",
        ]

    def get_profile_picture_url(self, obj):
        if not obj.profile_picture:
            return None
        request = self.context.get("request")
        url = obj.profile_picture.url
        return request.build_absolute_uri(url) if request else url


class DonorDetailSerializer(serializers.ModelSerializer):
    profile_picture_url = serializers.SerializerMethodField()
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
            "profile_picture",
            "profile_picture_url",
            "latitude",
            "longitude",
            "date_of_birth",
            "address",
            "emergency_contact_name",
            "emergency_contact_phone",
            "last_donation_date",
            "notes",
            "remove_profile_picture",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at", "profile_picture_url"]

    def get_profile_picture_url(self, obj):
        if not obj.profile_picture:
            return None
        request = self.context.get("request")
        url = obj.profile_picture.url
        return request.build_absolute_uri(url) if request else url

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
        return super().create(validated_data)

    def update(self, instance, validated_data):
        remove_picture = validated_data.pop("remove_profile_picture", False)
        if remove_picture and instance.profile_picture:
            instance.profile_picture.delete(save=False)
            instance.profile_picture = None
        return super().update(instance, validated_data)
