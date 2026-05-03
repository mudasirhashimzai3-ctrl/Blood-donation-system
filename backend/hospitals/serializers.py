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
            "province",
            "city",
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
            "province",
            "city",
            "latitude",
            "longitude",
            "created_at",
            "updated_at",
        ]
        extra_kwargs = {
            "province": {"required": False},
            "city": {"required": False, "allow_blank": True},
        }
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

    def validate_province(self, value):
        if not value:
            return value
        normalized = value.strip()
        if len(normalized) < 2:
            raise serializers.ValidationError("Province must be at least 2 characters.")
        return normalized

    def validate_city(self, value):
        if not value:
            return value
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

        province = attrs.get("province")
        city = attrs.get("city")
        province_provided = bool(province)
        city_provided = bool(city)

        if province_provided:
            attrs["city"] = province
        elif city_provided:
            attrs["province"] = city
        elif self.instance is None:
            attrs["province"] = "Kabul"
            attrs["city"] = "Kabul"

        latitude = attrs.get("latitude", getattr(self.instance, "latitude", None))
        longitude = attrs.get("longitude", getattr(self.instance, "longitude", None))

        if latitude is not None and (latitude < -90 or latitude > 90):
            errors["latitude"] = "Latitude must be between -90 and 90."

        if longitude is not None and (longitude < -180 or longitude > 180):
            errors["longitude"] = "Longitude must be between -180 and 180."

        if errors:
            raise serializers.ValidationError(errors)

        return attrs
