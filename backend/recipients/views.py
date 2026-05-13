from django_filters import rest_framework as filterset
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets
from rest_framework import status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.models import normalize_role_name
from blood_requests.models import BloodRequest
from blood_requests.serializers import BloodRequestListSerializer
from core.pagination import StandardResultsSetPagination
from core.permissions import PermissionMixin

from .models import Recipient
from .serializers import RecipientDetailSerializer, RecipientListSerializer


class RecipientFilter(filterset.FilterSet):
    city = filterset.CharFilter(field_name="hospital__city", lookup_expr="iexact")

    class Meta:
        model = Recipient
        fields = ["required_blood_group", "emergency_level", "city"]


class RecipientViewSet(PermissionMixin, viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    permission_module = "recipients"
    queryset = Recipient.objects.select_related("hospital").all().order_by("-created_at")
    serializer_class = RecipientDetailSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_class = RecipientFilter
    ordering_fields = ["full_name", "created_at", "updated_at", "emergency_level"]
    ordering = ["-created_at"]

    def get_queryset(self):
        queryset = super().get_queryset()
        role_name = normalize_role_name(getattr(self.request.user, "role_name", None))
        if role_name == "recipient":
            recipient = getattr(self.request.user, "recipient", None)
            if recipient is None:
                return queryset.none()
            return queryset.filter(pk=recipient.pk)
        return queryset

    def get_serializer_class(self):
        if self.action == "list":
            return RecipientListSerializer
        return RecipientDetailSerializer

    @action(detail=False, methods=["get"], url_path="me")
    def me(self, request):
        recipient = getattr(request.user, "recipient", None)
        if recipient is None:
            return Response(
                {"detail": "Recipient profile is not configured for this account."},
                status=status.HTTP_404_NOT_FOUND,
            )
        serializer = RecipientDetailSerializer(recipient, context={"request": request})
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"], url_path="mobile-dashboard")
    def mobile_dashboard(self, request):
        recipient = getattr(request.user, "recipient", None)
        if recipient is None:
            return Response(
                {"detail": "Recipient profile is not configured for this account."},
                status=status.HTTP_404_NOT_FOUND,
            )

        active_requests = BloodRequest.objects.filter(
            recipient=recipient,
            deleted_at__isnull=True,
            is_active=True,
        ).order_by("-is_emergency", "-created_at")
        serialized = BloodRequestListSerializer(active_requests, many=True, context={"request": request}).data
        unread_notifications = request.user.notifications.filter(
            hidden_at__isnull=True,
            deleted_at__isnull=True,
            is_read=False,
        ).count()

        return Response(
            {
                "profile": RecipientDetailSerializer(recipient, context={"request": request}).data,
                "active_requests": serialized,
                "emergency_requests": [item for item in serialized if item.get("is_emergency")],
                "unread_notifications": unread_notifications,
            },
            status=status.HTTP_200_OK,
        )
