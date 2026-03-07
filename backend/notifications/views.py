import os

from django_filters import rest_framework as filterset
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, mixins, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from twilio.request_validator import RequestValidator

from core.pagination import StandardResultsSetPagination
from core.permissions import PermissionMixin
from notifications.models import Notification
from notifications.serializers import (
    MarkAllReadSerializer,
    NotificationDetailSerializer,
    NotificationListSerializer,
    NotificationReadSerializer,
)
from notifications.services.channels import publish_deleted, publish_unread_count, publish_updated


class NotificationFilter(filterset.FilterSet):
    date_from = filterset.IsoDateTimeFilter(field_name="created_at", lookup_expr="gte")
    date_to = filterset.IsoDateTimeFilter(field_name="created_at", lookup_expr="lte")

    class Meta:
        model = Notification
        fields = ["is_read", "status", "type", "sent_via", "priority", "event_key"]


class NotificationViewSet(
    PermissionMixin,
    mixins.ListModelMixin,
    mixins.RetrieveModelMixin,
    mixins.DestroyModelMixin,
    viewsets.GenericViewSet,
):
    permission_classes = [IsAuthenticated]
    permission_module = "notifications"
    serializer_class = NotificationDetailSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = NotificationFilter
    search_fields = ["title", "message"]
    ordering_fields = ["created_at", "updated_at", "sent_at", "read_at", "priority", "status"]
    ordering = ["-created_at"]

    def get_queryset(self):
        return (
            Notification.objects.filter(
                user=self.request.user,
                hidden_at__isnull=True,
                deleted_at__isnull=True,
            )
            .select_related("request", "donation")
            .order_by("-created_at")
        )

    def get_serializer_class(self):
        if self.action == "list":
            return NotificationListSerializer
        return NotificationDetailSerializer

    def perform_destroy(self, instance):
        from django.utils import timezone

        instance.hidden_at = timezone.now()
        instance.save(update_fields=["hidden_at", "updated_at"])
        publish_deleted(instance.user_id, instance.id)
        unread = self.get_queryset().filter(is_read=False).count()
        publish_unread_count(instance.user_id, unread)

    @action(detail=False, methods=["get"], url_path="unread-count")
    def unread_count(self, request):
        count = self.get_queryset().filter(is_read=False).count()
        return Response({"count": count}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["patch"], url_path="read")
    def set_read(self, request, pk=None):
        notification = self.get_object()
        serializer = NotificationReadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.update(notification, serializer.validated_data)
        payload = NotificationDetailSerializer(notification, context={"request": request}).data
        publish_updated(notification)
        unread = self.get_queryset().filter(is_read=False).count()
        publish_unread_count(notification.user_id, unread)
        return Response(payload, status=status.HTTP_200_OK)

    @action(detail=False, methods=["post"], url_path="mark-all-read")
    def mark_all_read(self, request):
        serializer = MarkAllReadSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        from django.utils import timezone

        queryset = self.filter_queryset(self.get_queryset()).filter(is_read=False)
        now = timezone.now()
        updated = queryset.update(is_read=True, read_at=now, updated_at=now)
        unread = self.get_queryset().filter(is_read=False).count()
        publish_unread_count(request.user.id, unread)
        return Response({"updated": updated}, status=status.HTTP_200_OK)


class NotificationSmsCallbackView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        auth_token = os.getenv("TWILIO_AUTH_TOKEN")
        if auth_token:
            validator = RequestValidator(auth_token)
            signature = request.headers.get("X-Twilio-Signature", "")
            if not validator.validate(
                request.build_absolute_uri(),
                request.data,
                signature,
            ):
                return Response({"detail": "Invalid signature"}, status=status.HTTP_400_BAD_REQUEST)

        message_sid = request.data.get("MessageSid")
        message_status = request.data.get("MessageStatus")
        if not message_sid:
            return Response({"detail": "MessageSid is required"}, status=status.HTTP_400_BAD_REQUEST)

        mapped_status = "sent"
        failed_statuses = {"failed", "undelivered", "canceled"}
        delivered_statuses = {"delivered"}
        if message_status in failed_statuses:
            mapped_status = "failed"
        elif message_status in delivered_statuses:
            mapped_status = "delivered"

        notification = Notification.objects.filter(
            provider_message_id=message_sid,
            sent_via="sms",
            deleted_at__isnull=True,
        ).first()
        if not notification:
            return Response({"detail": "Notification not found"}, status=status.HTTP_200_OK)

        notification.status = mapped_status
        notification.provider_status = message_status
        notification.provider_response = dict(request.data)
        if mapped_status == "failed":
            notification.error_message = str(request.data.get("ErrorMessage") or "SMS delivery failed")
        notification.save(
            update_fields=[
                "status",
                "provider_status",
                "provider_response",
                "error_message",
                "updated_at",
            ]
        )
        publish_updated(notification)
        unread = Notification.objects.filter(
            user_id=notification.user_id,
            hidden_at__isnull=True,
            deleted_at__isnull=True,
            is_read=False,
        ).count()
        publish_unread_count(notification.user_id, unread)
        return Response({"detail": "ok"}, status=status.HTTP_200_OK)
