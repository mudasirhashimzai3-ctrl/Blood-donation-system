from django.db import transaction
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.models import normalize_role_name
from blood_requests.models import BloodRequest, BloodRequestNotification
from core.pagination import StandardResultsSetPagination
from core.permissions import PermissionMixin
from donations.models import Donation
from donations.serializers import (
    DonationDetailSerializer,
    DonationEstimateRefreshSerializer,
    DonationListSerializer,
    DonationRespondSerializer,
    DonationReminderSerializer,
    DonationSetPrimarySerializer,
    DonationStatusUpdateSerializer,
    apply_status_update,
)
from donations.services.reminders import send_donation_reminder
from donations.services.sync import notify_request_fulfilled_to_other_donors, sync_candidate_notification_for_donation


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
        "request__hospital__name",
    ]
    ordering_fields = [
        "created_at",
        "updated_at",
        "notified_at",
        "response_time",
        "distance_km",
        "estimated_arrival_time",
    ]
    ordering = ["-created_at"]

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        role_name = normalize_role_name(getattr(user, "role_name", None))
        if role_name == "admin":
            return queryset

        if role_name == "donor":
            donor_profile = getattr(user, "donor", None)
            if not donor_profile:
                return queryset.none()
            return queryset.filter(donor=donor_profile)

        if role_name == "recipient":
            recipient_profile = getattr(user, "recipient", None)
            if not recipient_profile:
                return queryset.none()
            return queryset.filter(request__recipient=recipient_profile)

        return queryset.none()

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

    @action(detail=True, methods=["post"], url_path="respond")
    def respond(self, request, pk=None):
        donation = self.get_object()
        serializer = DonationRespondSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        response_action = serializer.validated_data["action"]
        role_name = normalize_role_name(getattr(request.user, "role_name", None))

        if role_name != "donor":
            raise PermissionDenied("Only donor users can respond to donation requests.")

        with transaction.atomic():
            locked_donation = (
                Donation.objects.select_for_update()
                .select_related("request", "donor", "request__hospital")
                .filter(pk=donation.pk, deleted_at__isnull=True)
                .first()
            )
            if not locked_donation:
                raise ValidationError({"detail": "Donation not found."})

            if locked_donation.donor.user_id != request.user.id:
                raise PermissionDenied("You can only respond to your own donation requests.")

            blood_request = (
                BloodRequest.objects.select_for_update()
                .filter(pk=locked_donation.request_id, deleted_at__isnull=True)
                .first()
            )
            if not blood_request:
                raise ValidationError({"detail": "Blood request not found."})

            if response_action == "decline":
                if locked_donation.status != "pending":
                    raise ValidationError({"detail": "Only pending donations can be declined."})
                locked_donation = apply_status_update(locked_donation, status_value="declined")
                output = DonationDetailSerializer(locked_donation, context={"request": request})
                return Response(output.data, status=status.HTTP_200_OK)

            if blood_request.status in {"matched", "completed", "cancelled"} or blood_request.assigned_donor_id:
                raise ValidationError({"detail": "This request has already been accepted by another donor."})
            if locked_donation.status != "pending":
                raise ValidationError({"detail": "Only pending donations can be accepted."})

            now = timezone.now()
            locked_donation.status = "accepted"
            locked_donation.is_primary = True
            locked_donation.responded_at = locked_donation.responded_at or now
            if locked_donation.notified_at:
                delta = locked_donation.responded_at - locked_donation.notified_at
                locked_donation.response_time = max(0, int(delta.total_seconds() // 60))
            locked_donation.save(
                update_fields=[
                    "status",
                    "is_primary",
                    "responded_at",
                    "response_time",
                    "updated_at",
                ]
            )
            sync_candidate_notification_for_donation(locked_donation)

            blood_request.assigned_donor = locked_donation.donor
            blood_request.status = "matched"
            blood_request.matched_at = now
            blood_request.save(update_fields=["assigned_donor", "status", "matched_at", "updated_at"])

            sibling_rows = Donation.objects.select_for_update().filter(
                request=blood_request,
                deleted_at__isnull=True,
            ).exclude(pk=locked_donation.pk)
            for sibling in sibling_rows:
                was_pending_like = sibling.status in Donation.PRIMARY_ACTIVE_STATUSES
                sibling.is_primary = False
                if was_pending_like:
                    sibling.status = "expired"
                    sibling.responded_at = sibling.responded_at or now
                    if sibling.notified_at and sibling.response_time is None:
                        delta = sibling.responded_at - sibling.notified_at
                        sibling.response_time = max(0, int(delta.total_seconds() // 60))
                sibling.save(
                    update_fields=["is_primary", "status", "responded_at", "response_time", "updated_at"]
                )
                sync_candidate_notification_for_donation(sibling)

            BloodRequestNotification.objects.filter(
                blood_request=blood_request,
                channel="in_app",
                response_status="pending",
            ).exclude(donor=locked_donation.donor).update(response_status="expired", responded_at=now, updated_at=now)

        _create_system_notifications(
            event_key="blood_request_assigned",
            type="request_update",
            title=f"Donor accepted request #{blood_request.id}",
            message=f"Donor {locked_donation.donor} accepted blood request #{blood_request.id}.",
            sent_via=["in_app"],
            role_names=["admin", "receptionist"],
            user_ids=[blood_request.recipient.user_id] if blood_request.recipient.user_id else None,
            request_id=blood_request.id,
            donation_id=locked_donation.id,
            metadata={"status": blood_request.status, "donor_id": locked_donation.donor_id},
        )
        notify_request_fulfilled_to_other_donors(
            blood_request=blood_request,
            winning_donor_id=locked_donation.donor_id,
        )

        output = DonationDetailSerializer(locked_donation, context={"request": request})
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
