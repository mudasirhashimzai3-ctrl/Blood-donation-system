import threading

from django.conf import settings
from django.db import transaction
from django.db.models import Q
from django_filters import rest_framework as filterset
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, parsers, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.models import normalize_role_name
from core.pagination import StandardResultsSetPagination
from core.permissions import PermissionMixin
from donations.models import Donation
from donations.services.compatibility import get_legacy_notifications_for_request
from donations.services.sync import (
    expire_pending_donations_for_request,
    notify_request_fulfilled_to_other_donors,
    sync_candidate_notification_for_donation,
)

from recipients.models import Recipient

from .models import BloodRequest, BloodRequestNotification
from .serializers import (
    AssignDonorSerializer,
    BloodRequestDetailSerializer,
    BloodRequestListSerializer,
    BloodRequestNotificationSerializer,
    BloodRequestRecipientOptionSerializer,
    BloodRequestWriteSerializer,
    CancelBloodRequestSerializer,
)
from .tasks import run_request_automation
from .services.matching import apply_request_defaults


def _create_system_notifications(**kwargs):
    try:
        from notifications.services import create_notifications

        create_notifications(**kwargs)
    except Exception:
        return


def _run_request_automation_safely(request_id: int):
    try:
        run_request_automation(request_id)
    except Exception:
        return


def _queue_request_automation_or_fallback(request_id: int):
    try:
        delay = getattr(run_request_automation, "delay", None)
        if callable(delay):
            delay(request_id)
            return
    except Exception:
        pass

    _run_request_automation_safely(request_id)


def _start_request_automation_worker(request_id: int):
    thread = threading.Thread(
        target=_queue_request_automation_or_fallback,
        args=(request_id,),
        daemon=True,
    )
    thread.start()


def _enqueue_request_automation(request_id: int):
    if getattr(settings, "CELERY_TASK_ALWAYS_EAGER", False):
        _run_request_automation_safely(request_id)
        return

    transaction.on_commit(lambda: _start_request_automation_worker(request_id))


def _ensure_recipient_profile_for_user(user):
    recipient = getattr(user, "recipient", None)
    if recipient is not None:
        return recipient

    full_name = f"{(user.first_name or '').strip()} {(user.last_name or '').strip()}".strip() or user.username
    phone = (getattr(user, "phone", None) or "").strip() or f"user-{user.id}"
    email = ((getattr(user, "email", None) or "").strip() or None)

    recipient = Recipient.objects.filter(
        user__isnull=True,
        phone=phone,
        deleted_at__isnull=True,
    ).first()
    if recipient:
        recipient.user = user
        recipient.full_name = full_name
        recipient.email = email
        if not recipient.emergency_level:
            recipient.emergency_level = "normal"
        recipient.save(update_fields=["user", "full_name", "email", "emergency_level", "updated_at"])
        return recipient

    return Recipient.objects.create(
        user=user,
        full_name=full_name,
        email=email,
        phone=phone,
        emergency_level="normal",
    )


class BloodRequestFilter(filterset.FilterSet):
    class Meta:
        model = BloodRequest
        fields = [
            "status",
            "blood_group",
            "request_type",
            "is_verified",
            "is_emergency",
            "hospital",
            "recipient",
            "assigned_donor",
        ]


class BloodRequestViewSet(PermissionMixin, viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    permission_module = "blood_requests"
    queryset = BloodRequest.objects.select_related("recipient", "hospital", "assigned_donor").all().order_by("-created_at")
    serializer_class = BloodRequestDetailSerializer
    pagination_class = StandardResultsSetPagination
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = BloodRequestFilter
    search_fields = [
        "hospital__name",
        "assigned_donor__first_name",
        "assigned_donor__last_name",
        "assigned_donor__phone",
    ]
    ordering_fields = ["created_at", "updated_at", "response_deadline", "units_needed"]
    ordering = ["-created_at"]

    def get_queryset(self):
        queryset = super().get_queryset()
        user = self.request.user
        role_name = normalize_role_name(getattr(user, "role_name", None))
        if role_name == "admin":
            return queryset

        if role_name == "recipient":
            recipient_profile = getattr(user, "recipient", None)
            if not recipient_profile:
                return queryset.none()
            return queryset.filter(recipient=recipient_profile)

        if role_name == "donor":
            donor_profile = getattr(user, "donor", None)
            if not donor_profile:
                return queryset.none()
            return queryset.filter(donations__donor=donor_profile).distinct()

        return queryset.none()

    def get_serializer_class(self):
        if self.action == "list":
            return BloodRequestListSerializer
        if self.action in {"create", "update", "partial_update"}:
            return BloodRequestWriteSerializer
        return BloodRequestDetailSerializer

    def perform_create(self, serializer):
        user = self.request.user
        role_name = normalize_role_name(getattr(user, "role_name", None))

        if role_name == "admin":
            recipient_profile = serializer.validated_data.get("recipient")
            if recipient_profile is None:
                raise ValidationError({"recipient": "Recipient is required for admin-created requests."})
        elif role_name == "recipient":
            recipient_profile = _ensure_recipient_profile_for_user(user)
        else:
            raise ValidationError({"detail": "Only admin or recipient users can create blood requests."})

        instance = serializer.save(recipient=recipient_profile, is_verified=True)
        apply_request_defaults(instance)
        _create_system_notifications(
            event_key="blood_request_created",
            type="request_update",
            title=f"Blood request #{instance.id} created",
            message=f"Recipient {instance.recipient.full_name} created a {instance.request_type} request.",
            sent_via=["in_app"],
            role_names=["admin", "receptionist"],
            request_id=instance.id,
            metadata={"status": instance.status, "request_type": instance.request_type},
        )
        if instance.auto_match_enabled and instance.status == "pending":
            _enqueue_request_automation(instance.id)

    @action(detail=False, methods=["get"], url_path="recipients")
    def recipients(self, request):
        queryset = Recipient.objects.filter(deleted_at__isnull=True).order_by("full_name")
        search = request.query_params.get("search", "").strip()
        if search:
            queryset = queryset.filter(Q(full_name__icontains=search) | Q(phone__icontains=search))

        page = self.paginate_queryset(queryset)
        serializer = BloodRequestRecipientOptionSerializer(page if page is not None else queryset, many=True)
        if page is not None:
            return self.get_paginated_response(serializer.data)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"], url_path="active-options")
    def active_options(self, request):
        role_name = normalize_role_name(getattr(request.user, "role_name", None))
        if role_name != "admin":
            raise PermissionDenied("Only admin users can access active blood request options.")

        queryset = (
            BloodRequest.objects.select_related("recipient", "hospital", "assigned_donor")
            .filter(deleted_at__isnull=True, is_active=True, status__in=["pending", "matched"])
            .order_by("-is_emergency", "response_deadline", "-created_at")
        )
        page = self.paginate_queryset(queryset)
        serializer = BloodRequestListSerializer(
            page if page is not None else queryset,
            many=True,
            context={"request": request},
        )
        if page is not None:
            return self.get_paginated_response(serializer.data)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def perform_update(self, serializer):
        current = self.get_object()
        if current.status in {"completed", "cancelled"}:
            raise ValidationError({"detail": "Cannot edit a completed or cancelled request."})
        instance = serializer.save(is_verified=True)
        apply_request_defaults(instance)
        if instance.auto_match_enabled and instance.status == "pending":
            _enqueue_request_automation(instance.id)

    @action(detail=True, methods=["post"], url_path="run-auto-match")
    def run_auto_match(self, request, pk=None):
        blood_request = self.get_object()
        if blood_request.status in {"completed", "cancelled"}:
            raise ValidationError({"detail": "Cannot run auto-match for a completed or cancelled request."})

        result = run_request_automation(blood_request.id)
        blood_request.refresh_from_db()
        serializer = BloodRequestDetailSerializer(blood_request, context={"request": request})
        return Response(
            {
                "request": serializer.data,
                "matched_candidates": result.get("candidates", 0) if isinstance(result, dict) else 0,
            },
            status=status.HTTP_200_OK,
        )

    @action(detail=True, methods=["patch"], url_path="assign-donor")
    def assign_donor(self, request, pk=None):
        blood_request = self.get_object()
        if blood_request.status != "pending":
            raise ValidationError({"detail": "Only pending requests can be assigned."})

        serializer = AssignDonorSerializer(data=request.data, context={"blood_request": blood_request})
        serializer.is_valid(raise_exception=True)
        donor = serializer.context["donor"]

        from django.utils import timezone
        now = timezone.now()
        blood_request.assigned_donor = donor
        blood_request.status = "matched"
        blood_request.matched_at = now
        blood_request.save(update_fields=["assigned_donor", "status", "matched_at", "updated_at"])
        _create_system_notifications(
            event_key="blood_request_assigned",
            type="request_update",
            title=f"Donor assigned to request #{blood_request.id}",
            message=f"Assigned donor {donor} to blood request #{blood_request.id}.",
            sent_via=["in_app"],
            role_names=["admin", "receptionist"],
            request_id=blood_request.id,
            metadata={"donor_id": donor.id, "status": blood_request.status},
        )

        Donation.objects.filter(
            request=blood_request,
            deleted_at__isnull=True,
            is_primary=True,
        ).exclude(donor=donor).update(is_primary=False, updated_at=now)
        donation = Donation.objects.filter(
            request=blood_request,
            donor=donor,
            deleted_at__isnull=True,
        ).first()
        if donation:
            donation.is_primary = True
            if donation.status == "pending":
                donation.status = "accepted"
                donation.responded_at = now
                if donation.notified_at:
                    delta = donation.responded_at - donation.notified_at
                    donation.response_time = max(0, int(delta.total_seconds() // 60))
            donation.save(
                update_fields=[
                    "is_primary",
                    "status",
                    "responded_at",
                    "response_time",
                    "updated_at",
                ]
            )
            sync_candidate_notification_for_donation(donation)

        other_candidates = Donation.objects.filter(
            request=blood_request,
            deleted_at__isnull=True,
            status__in=Donation.PRIMARY_ACTIVE_STATUSES,
        ).exclude(donor=donor)
        for candidate in other_candidates:
            candidate.is_primary = False
            candidate.status = "expired"
            candidate.responded_at = candidate.responded_at or now
            if candidate.notified_at and candidate.response_time is None:
                delta = candidate.responded_at - candidate.notified_at
                candidate.response_time = max(0, int(delta.total_seconds() // 60))
            candidate.save(
                update_fields=[
                    "is_primary",
                    "status",
                    "responded_at",
                    "response_time",
                    "updated_at",
                ]
            )
            sync_candidate_notification_for_donation(candidate)

        BloodRequestNotification.objects.filter(
            blood_request=blood_request,
            channel="in_app",
            response_status="pending",
        ).exclude(donor=donor).update(response_status="expired", responded_at=now, updated_at=now)
        BloodRequestNotification.objects.filter(
            blood_request=blood_request,
            donor=donor,
            channel="in_app",
        ).update(response_status="accepted", responded_at=now, updated_at=now)
        notify_request_fulfilled_to_other_donors(
            blood_request=blood_request,
            winning_donor_id=donor.id,
        )

        output = BloodRequestDetailSerializer(blood_request, context={"request": request})
        return Response(output.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["patch"])
    def complete(self, request, pk=None):
        blood_request = self.get_object()
        if blood_request.status != "matched":
            raise ValidationError({"detail": "Only matched requests can be completed."})

        from django.utils import timezone

        blood_request.status = "completed"
        blood_request.is_active = False
        blood_request.completed_at = timezone.now()
        blood_request.save(update_fields=["status", "is_active", "completed_at", "updated_at"])
        _create_system_notifications(
            event_key="blood_request_completed",
            type="request_update",
            title=f"Blood request #{blood_request.id} completed",
            message=f"Blood request #{blood_request.id} has been marked completed.",
            sent_via=["in_app"],
            role_names=["admin", "receptionist"],
            request_id=blood_request.id,
            metadata={"status": blood_request.status},
        )

        if blood_request.assigned_donor_id:
            blood_request.assigned_donor.last_donation_date = timezone.localdate()
            blood_request.assigned_donor.save(update_fields=["last_donation_date", "updated_at"])
            assigned = Donation.objects.filter(
                request=blood_request,
                donor_id=blood_request.assigned_donor_id,
                deleted_at__isnull=True,
            ).first()
            if assigned:
                assigned.status = "completed"
                assigned.is_primary = True
                assigned.responded_at = assigned.responded_at or timezone.now()
                if assigned.notified_at and assigned.response_time is None:
                    delta = assigned.responded_at - assigned.notified_at
                    assigned.response_time = max(0, int(delta.total_seconds() // 60))
                assigned.save(
                    update_fields=[
                        "status",
                        "is_primary",
                        "responded_at",
                        "response_time",
                        "updated_at",
                    ]
                )

        output = BloodRequestDetailSerializer(blood_request, context={"request": request})
        return Response(output.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["patch"])
    def cancel(self, request, pk=None):
        blood_request = self.get_object()
        if blood_request.status in {"completed", "cancelled"}:
            raise ValidationError({"detail": "Completed or cancelled requests cannot be cancelled again."})

        serializer = CancelBloodRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        from django.utils import timezone

        blood_request.status = "cancelled"
        blood_request.is_active = False
        blood_request.cancelled_at = timezone.now()
        blood_request.cancelled_by = serializer.validated_data["cancelled_by"]
        blood_request.rejection_reason = serializer.validated_data.get("rejection_reason")
        blood_request.save(
            update_fields=[
                "status",
                "is_active",
                "cancelled_at",
                "cancelled_by",
                "rejection_reason",
                "updated_at",
            ]
        )
        _create_system_notifications(
            event_key="blood_request_cancelled",
            type="request_update",
            title=f"Blood request #{blood_request.id} cancelled",
            message=f"Blood request #{blood_request.id} cancelled by {blood_request.cancelled_by}.",
            sent_via=["in_app"],
            role_names=["admin", "receptionist"],
            request_id=blood_request.id,
            metadata={"status": blood_request.status, "reason": blood_request.rejection_reason},
        )
        expire_pending_donations_for_request(
            blood_request=blood_request,
            cancellation_reason=blood_request.rejection_reason,
        )

        output = BloodRequestDetailSerializer(blood_request, context={"request": request})
        return Response(output.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["patch"])
    def verify(self, request, pk=None):
        blood_request = self.get_object()
        # Verification is automatic in the current workflow.
        blood_request.is_verified = True
        blood_request.save(update_fields=["is_verified", "updated_at"])
        _create_system_notifications(
            event_key="blood_request_verified",
            type="request_update",
            title=f"Verification updated for request #{blood_request.id}",
            message=f"Blood request #{blood_request.id} is verified automatically.",
            sent_via=["in_app"],
            role_names=["admin", "receptionist"],
            request_id=blood_request.id,
            metadata={"is_verified": blood_request.is_verified},
        )

        output = BloodRequestDetailSerializer(blood_request, context={"request": request})
        return Response(output.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["get"])
    def notifications(self, request, pk=None):
        blood_request = self.get_object()
        legacy_payload = get_legacy_notifications_for_request(blood_request)
        if legacy_payload:
            return Response(legacy_payload, status=status.HTTP_200_OK)

        queryset = BloodRequestNotification.objects.select_related("donor").filter(
            blood_request=blood_request
        ).order_by("distance_km", "-queued_at")
        serializer = BloodRequestNotificationSerializer(queryset, many=True, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"], url_path="donor-responses")
    def donor_responses(self, request):
        recipient_profile = getattr(request.user, "recipient", None)
        if recipient_profile is None:
            raise ValidationError({"detail": "Recipient profile is not configured for this account."})

        requests_qs = (
            BloodRequest.objects.filter(
                recipient=recipient_profile,
                deleted_at__isnull=True,
            )
            .order_by("-is_emergency", "-created_at")
        )

        payload = []
        for blood_request in requests_qs:
            notifications = BloodRequestNotification.objects.select_related("donor").filter(
                blood_request=blood_request,
                deleted_at__isnull=True,
            ).order_by("-updated_at")
            donation_rows = Donation.objects.filter(
                request=blood_request,
                deleted_at__isnull=True,
            ).select_related("donor")
            donation_by_donor = {row.donor_id: row for row in donation_rows}
            responses = []
            for item in notifications:
                donation = donation_by_donor.get(item.donor_id)
                responses.append(
                    {
                        "notification_id": item.id,
                        "donor_id": item.donor_id,
                        "donor_name": str(item.donor),
                        "donor_phone": item.donor.phone,
                        "channel": item.channel,
                        "delivery_status": item.delivery_status,
                        "response_status": item.response_status,
                        "responded_at": item.responded_at,
                        "distance_km": item.distance_km,
                        "donation_status": donation.status if donation else None,
                        "donation_id": donation.id if donation else None,
                    }
                )
            payload.append(
                {
                    "request": BloodRequestListSerializer(
                        blood_request,
                        context={"request": request},
                    ).data,
                    "responses": responses,
                }
            )
        return Response(payload, status=status.HTTP_200_OK)
