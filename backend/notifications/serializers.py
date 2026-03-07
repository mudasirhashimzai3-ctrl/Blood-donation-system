from django.utils import timezone
from rest_framework import serializers

from notifications.models import Notification


class NotificationListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = [
            "id",
            "user_id",
            "user_type",
            "request_id",
            "donation_id",
            "event_key",
            "type",
            "title",
            "message",
            "sent_via",
            "status",
            "priority",
            "is_read",
            "read_at",
            "sent_at",
            "created_at",
            "updated_at",
        ]


class NotificationDetailSerializer(NotificationListSerializer):
    class Meta(NotificationListSerializer.Meta):
        fields = NotificationListSerializer.Meta.fields + [
            "metadata",
            "dedupe_key",
            "error_message",
            "provider_message_id",
            "provider_status",
            "provider_response",
            "delivery_attempts",
            "expires_at",
        ]


class NotificationReadSerializer(serializers.Serializer):
    is_read = serializers.BooleanField()

    def update(self, instance, validated_data):
        is_read = validated_data["is_read"]
        instance.is_read = is_read
        instance.read_at = timezone.now() if is_read else None
        instance.save(update_fields=["is_read", "read_at", "updated_at"])
        return instance


class MarkAllReadSerializer(serializers.Serializer):
    pass
