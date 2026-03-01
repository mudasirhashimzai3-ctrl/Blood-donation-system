from django_filters import rest_framework as filterset
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, parsers, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.pagination import StandardResultsSetPagination
from core.permissions import PermissionMixin

from .models import BloodRequest, BloodRequestNotification
from .serializers import (
    AssignDonorSerializer,
    BloodRequestDetailSerializer,
    BloodRequestListSerializer,
    BloodRequestNotificationSerializer,
    BloodRequestWriteSerializer,
    CancelBloodRequestSerializer,
    VerifyBloodRequestSerializer,
)
from .services.matching import auto_match_blood_request


class BloodRequestFilter(filterset.FilterSet):
    class Meta:
        model = BloodRequest
        fields = [
            "status",
            "blood_group",
            "request_type",
            "priority",
            "is_verified",
            "is_emergency",
            "is_active",
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
        "recipient__full_name",
        "recipient__phone",
        "hospital__name",
        "assigned_donor__first_name",
        "assigned_donor__last_name",
        "assigned_donor__phone",
    ]
    ordering_fields = ["created_at", "updated_at", "response_deadline", "priority", "units_needed"]
    ordering = ["-created_at"]

    def get_serializer_class(self):
        if self.action == "list":
            return BloodRequestListSerializer
        if self.action in {"create", "update", "partial_update"}:
            return BloodRequestWriteSerializer
        if self.action == "notifications":
            return BloodRequestNotificationSerializer
        return BloodRequestDetailSerializer

    def perform_create(self, serializer):
        instance = serializer.save()
        if instance.auto_match_enabled:
            auto_match_blood_request(instance)

    def perform_update(self, serializer):
        current = self.get_object()
        if current.status in {"completed", "cancelled"}:
            raise ValidationError({"detail": "Cannot edit a completed or cancelled request."})
        instance = serializer.save()
        if instance.auto_match_enabled and instance.status == "pending":
            auto_match_blood_request(instance)

    @action(detail=True, methods=["post"], url_path="run-auto-match")
    def run_auto_match(self, request, pk=None):
        blood_request = self.get_object()
        if blood_request.status in {"completed", "cancelled"}:
            raise ValidationError({"detail": "Cannot run auto-match for a completed or cancelled request."})

        notifications = auto_match_blood_request(blood_request)
        serializer = BloodRequestDetailSerializer(blood_request, context={"request": request})
        return Response(
            {
                "request": serializer.data,
                "matched_candidates": len(notifications),
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

        blood_request.assigned_donor = donor
        blood_request.status = "matched"
        blood_request.matched_at = timezone.now()
        blood_request.save(update_fields=["assigned_donor", "status", "matched_at", "updated_at"])

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

        output = BloodRequestDetailSerializer(blood_request, context={"request": request})
        return Response(output.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["patch"])
    def verify(self, request, pk=None):
        blood_request = self.get_object()
        serializer = VerifyBloodRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        blood_request.is_verified = serializer.validated_data["is_verified"]
        blood_request.save(update_fields=["is_verified", "updated_at"])

        output = BloodRequestDetailSerializer(blood_request, context={"request": request})
        return Response(output.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["get"])
    def notifications(self, request, pk=None):
        blood_request = self.get_object()
        queryset = BloodRequestNotification.objects.select_related("donor").filter(blood_request=blood_request).order_by(
            "distance_km",
            "-queued_at",
        )
        serializer = BloodRequestNotificationSerializer(queryset, many=True, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)
