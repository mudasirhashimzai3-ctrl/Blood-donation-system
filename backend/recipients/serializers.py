from rest_framework import serializers

from .models import Recipient


class RecipientListSerializer(serializers.ModelSerializer):
    hospital_name = serializers.CharField(source="hospital.name", read_only=True)
    city = serializers.CharField(source="hospital.city", read_only=True)

    class Meta:
        model = Recipient
        fields = [
            "id",
            "full_name",
            "phone",
            "required_blood_group",
            "hospital_name",
            "emergency_level",
            "city",
            "status",
            "created_at",
        ]


class RecipientDetailSerializer(serializers.ModelSerializer):
    hospital_name = serializers.CharField(source="hospital.name", read_only=True)
    hospital_phone = serializers.CharField(source="hospital.phone", read_only=True, allow_null=True)
    hospital_email = serializers.CharField(source="hospital.email", read_only=True, allow_null=True)
    hospital_address = serializers.CharField(source="hospital.address", read_only=True)
    city = serializers.CharField(source="hospital.city", read_only=True)
    latitude = serializers.DecimalField(source="hospital.latitude", read_only=True, max_digits=9, decimal_places=6)
    longitude = serializers.DecimalField(source="hospital.longitude", read_only=True, max_digits=9, decimal_places=6)
    hospital_is_active = serializers.BooleanField(source="hospital.is_active", read_only=True)

    class Meta:
        model = Recipient
        fields = [
            "id",
            "full_name",
            "email",
            "phone",
            "required_blood_group",
            "age",
            "gender",
            "hospital",
            "hospital_name",
            "hospital_phone",
            "hospital_email",
            "hospital_address",
            "city",
            "latitude",
            "longitude",
            "hospital_is_active",
            "emergency_level",
            "status",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
            "hospital_name",
            "hospital_phone",
            "hospital_email",
            "hospital_address",
            "city",
            "latitude",
            "longitude",
            "hospital_is_active",
        ]

    def validate_full_name(self, value):
        normalized = value.strip()
        if len(normalized) < 2:
            raise serializers.ValidationError("Full name must be at least 2 characters.")
        return normalized

    def validate_phone(self, value):
        normalized_phone = value.strip()
        queryset = Recipient.all_objects.filter(phone=normalized_phone, deleted_at__isnull=True)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        if queryset.exists():
            raise serializers.ValidationError("Phone number already exists.")
        return normalized_phone

    def validate_email(self, value):
        if not value:
            return None

        normalized_email = value.strip().lower()
        queryset = Recipient.all_objects.filter(email__iexact=normalized_email, deleted_at__isnull=True)
        if self.instance:
            queryset = queryset.exclude(pk=self.instance.pk)
        if queryset.exists():
            raise serializers.ValidationError("Email already exists.")
        return normalized_email

    def validate_age(self, value):
        if value < 1 or value > 120:
            raise serializers.ValidationError("Age must be between 1 and 120.")
        return value
