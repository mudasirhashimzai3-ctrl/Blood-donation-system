from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, parsers, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from accounts.models import normalize_role_name
from blood_requests.serializers import BloodRequestListSerializer
from core.pagination import StandardResultsSetPagination
from core.permissions import PermissionMixin

from donations.models import Donation
from .models import Donor
from .serializers import DonorDetailSerializer, DonorListSerializer


class DonorViewSet(PermissionMixin, viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    permission_module = "donors"
    queryset = Donor.objects.all().order_by("-created_at")
    serializer_class = DonorDetailSerializer
    pagination_class = StandardResultsSetPagination
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ["blood_group", "permanent_address_city", "local_address_city"]
    ordering_fields = ["first_name", "last_name", "created_at", "updated_at", "last_donation_date"]
    ordering = ["-created_at"]

    def get_queryset(self):
        queryset = super().get_queryset()
        role_name = normalize_role_name(getattr(self.request.user, "role_name", None))
        if role_name == "donor":
            donor = getattr(self.request.user, "donor", None)
            if donor is None:
                return queryset.none()
            return queryset.filter(pk=donor.pk)
        return queryset

    def get_serializer_class(self):
        if self.action == "list":
            return DonorListSerializer
        return DonorDetailSerializer

    @action(detail=False, methods=["get"], url_path="me")
    def me(self, request):
        donor = getattr(request.user, "donor", None)
        if donor is None:
            return Response(
                {"detail": "Donor profile is not configured for this account."},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = DonorDetailSerializer(donor, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"], url_path="mobile-dashboard")
    def mobile_dashboard(self, request):
        donor = getattr(request.user, "donor", None)
        if donor is None:
            return Response(
                {"detail": "Donor profile is not configured for this account."},
                status=status.HTTP_404_NOT_FOUND,
            )

        candidate_donations = (
            Donation.objects.select_related("request", "request__hospital", "request__recipient")
            .filter(
                donor=donor,
                deleted_at__isnull=True,
                request__deleted_at__isnull=True,
                request__is_active=True,
                request__status__in=["pending", "matched"],
            )
            .order_by("-request__is_emergency", "request__response_deadline", "-created_at")
        )
        request_payload = BloodRequestListSerializer(
            [item.request for item in candidate_donations],
            many=True,
            context={"request": request},
        ).data

        history_count = Donation.objects.filter(
            donor=donor,
            deleted_at__isnull=True,
            status="completed",
        ).count()

        unread_notifications = request.user.notifications.filter(
            hidden_at__isnull=True,
            deleted_at__isnull=True,
            is_read=False,
        ).count()

        return Response(
            {
                "profile": DonorDetailSerializer(donor, context={"request": request}).data,
                "nearby_requests": request_payload,
                "emergency_requests": [item for item in request_payload if item.get("is_emergency")],
                "history_count": history_count,
                "unread_notifications": unread_notifications,
            },
            status=status.HTTP_200_OK,
        )
