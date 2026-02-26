from django_filters import rest_framework as filterset
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.pagination import StandardResultsSetPagination
from core.permissions import PermissionMixin

from .models import Recipient
from .serializers import RecipientDetailSerializer, RecipientListSerializer


class RecipientFilter(filterset.FilterSet):
    city = filterset.CharFilter(field_name="hospital__city", lookup_expr="iexact")

    class Meta:
        model = Recipient
        fields = ["required_blood_group", "emergency_level", "status", "city"]


class RecipientViewSet(PermissionMixin, viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    permission_module = "recipients"
    queryset = Recipient.objects.select_related("hospital").all().order_by("-created_at")
    serializer_class = RecipientDetailSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = RecipientFilter
    search_fields = ["full_name", "phone"]
    ordering_fields = ["full_name", "created_at", "updated_at", "emergency_level"]
    ordering = ["-created_at"]

    def get_serializer_class(self):
        if self.action == "list":
            return RecipientListSerializer
        return RecipientDetailSerializer

    @action(detail=True, methods=["patch"])
    def block(self, request, pk=None):
        recipient = self.get_object()
        recipient.status = "blocked"
        recipient.save(update_fields=["status", "updated_at"])
        serializer = self.get_serializer(recipient)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["patch"])
    def unblock(self, request, pk=None):
        recipient = self.get_object()
        recipient.status = "active"
        recipient.save(update_fields=["status", "updated_at"])
        serializer = self.get_serializer(recipient)
        return Response(serializer.data, status=status.HTTP_200_OK)
