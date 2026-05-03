from django_filters import rest_framework as filterset
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets
from rest_framework.permissions import IsAuthenticated

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

    def get_serializer_class(self):
        if self.action == "list":
            return RecipientListSerializer
        return RecipientDetailSerializer
