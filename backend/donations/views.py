from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.pagination import StandardResultsSetPagination
from core.permissions import PermissionMixin
from donations.models import Donation
from donations.serializers import (
    DonationDetailSerializer,
    DonationEstimateRefreshSerializer,
    DonationListSerializer,
    DonationReminderSerializer,
    DonationSetPrimarySerializer,
    DonationStatusUpdateSerializer,
    apply_status_update,
)
from donations.services.reminders import send_donation_reminder


def _create_system_notifications(**kwargs):
    try:
        from notifications.services import create_notifications

        create_notifications(**kwargs)
    except Exception:
        return


class DonationViewSet(PermissionMixin, viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    permission_module = "donations"
    queryset = Donation.objects.select_related(
        "request",
        "request__recipient",
        "request__hospital",
        "donor",
    ).all().order_by("-created_at")
    serializer_class = DonationDetailSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["status", "request", "donor", "is_primary"]
    search_fields = [
        "donor__first_name",
        "donor__last_name",
        "donor__phone",
        "request__recipient__full_name",
        "request__recipient__phone",
        "request__hospital__name",
    ]
    ordering_fields = [
        "created_at",
        "updated_at",
        "notified_at",
        "response_time",
        "distance_km",
        "estimated_arrival_time",
        "priority_score",
    ]
    ordering = ["-created_at"]

    def get_serializer_class(self):
        if self.action == "list":
            return DonationListSerializer
        return DonationDetailSerializer

    @action(detail=True, methods=["patch"], url_path="status")
    def update_status(self, request, pk=None):
        donation = self.get_object()
        serializer = DonationStatusUpdateSerializer(data=request.data, context={"donation": donation})
        serializer.is_valid(raise_exception=True)
        donation = apply_status_update(
            donation,
            status_value=serializer.validated_data["status"],
            notes=serializer.validated_data.get("notes"),
            cancellation_reason=serializer.validated_data.get("cancellation_reason"),
        )
        _create_system_notifications(
            event_key="donation_status_updated",
            type="donation_update",
            title=f"Donation #{donation.id} status updated",
            message=f"Donation #{donation.id} changed to {donation.status}.",
            sent_via=["in_app"],
            role_names=["admin", "receptionist"],
            request_id=donation.request_id,
            donation_id=donation.id,
            metadata={"status": donation.status},
        )
        output = DonationDetailSerializer(donation, context={"request": request})
        return Response(output.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["patch"], url_path="set-primary")
    def set_primary(self, request, pk=None):
        donation = self.get_object()
        serializer = DonationSetPrimarySerializer(data=request.data, context={"donation": donation})
        serializer.is_valid(raise_exception=True)
        value = serializer.validated_data["is_primary"]
        if value:
            Donation.objects.filter(
                request=donation.request,
                deleted_at__isnull=True,
                is_primary=True,
                status__in=Donation.PRIMARY_ACTIVE_STATUSES,
            ).exclude(pk=donation.pk).update(is_primary=False)
        donation.is_primary = value
        donation.save(update_fields=["is_primary", "updated_at"])
        _create_system_notifications(
            event_key="donation_primary_changed",
            type="donation_update",
            title=f"Primary donor updated for request #{donation.request_id}",
            message=f"Donation #{donation.id} primary flag set to {donation.is_primary}.",
            sent_via=["in_app"],
            role_names=["admin", "receptionist"],
            request_id=donation.request_id,
            donation_id=donation.id,
            metadata={"is_primary": donation.is_primary},
        )
        output = DonationDetailSerializer(donation, context={"request": request})
        return Response(output.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], url_path="refresh-estimate")
    def refresh_estimate(self, request, pk=None):
        donation = self.get_object()
        serializer = DonationEstimateRefreshSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        donation = serializer.update_donation(donation)
        output = DonationDetailSerializer(donation, context={"request": request})
        return Response(output.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], url_path="send-reminder")
    def send_reminder(self, request, pk=None):
        donation = self.get_object()
        serializer = DonationReminderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        if donation.status != "pending":
            return Response(
                {"detail": "Only pending donations can receive reminders."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        result = send_donation_reminder(donation, serializer.validated_data.get("channels"))
        _create_system_notifications(
            event_key="donation_reminder",
            type="reminder",
            title=f"Reminder sent for donation #{donation.id}",
            message=f"Reminder dispatched for donation #{donation.id}.",
            sent_via=["in_app"],
            role_names=["admin", "receptionist"],
            request_id=donation.request_id,
            donation_id=donation.id,
            metadata={"channels": serializer.validated_data.get("channels") or ["in_app", "email", "sms"]},
        )
        output = DonationDetailSerializer(donation, context={"request": request})
        return Response({"donation": output.data, "result": result}, status=status.HTTP_200_OK)
