from rest_framework import serializers

from .models import Hospital


class HospitalListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hospital
        fields = [
            "id",
            "name",
            "phone",
            "email",
            "city",
            "is_active",
            "created_at",
        ]


class HospitalDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Hospital
        fields = [
            "id",
            "name",
            "phone",
            "email",
            "address",
            "city",
            "latitude",
            "longitude",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]

    def validate_name(self, value):
        normalized = value.strip()
        if len(normalized) < 2:
            raise serializers.ValidationError("Hospital name must be at least 2 characters.")
        return normalized

    def validate_phone(self, value):
        if not value:
            return None
        return value.strip()

    def validate_email(self, value):
        if not value:
            return None
        return value.strip().lower()

    def validate_city(self, value):
        normalized = value.strip()
        if len(normalized) < 2:
            raise serializers.ValidationError("City must be at least 2 characters.")
        return normalized

    def validate_address(self, value):
        if not value:
            return None
        return value.strip()

    def validate(self, attrs):
        attrs = super().validate(attrs)
        errors = {}

        latitude = attrs.get("latitude", getattr(self.instance, "latitude", None))
        longitude = attrs.get("longitude", getattr(self.instance, "longitude", None))

        if latitude is not None and (latitude < -90 or latitude > 90):
            errors["latitude"] = "Latitude must be between -90 and 90."

        if longitude is not None and (longitude < -180 or longitude > 180):
            errors["longitude"] = "Longitude must be between -180 and 180."

        if errors:
            raise serializers.ValidationError(errors)

        return attrs

