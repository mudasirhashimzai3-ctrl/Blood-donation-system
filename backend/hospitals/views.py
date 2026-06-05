from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import AllowAny, IsAuthenticated

from core.pagination import StandardResultsSetPagination
from core.permissions import PermissionMixin

from .models import Hospital
from .serializers import HospitalDetailSerializer, HospitalListSerializer


class HospitalViewSet(PermissionMixin, viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    permission_module = "hospitals"
    queryset = Hospital.objects.all().order_by("name")
    serializer_class = HospitalDetailSerializer
    pagination_class = StandardResultsSetPagination
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["province", "city"]
    search_fields = ["name", "phone", "email", "province", "city", "address"]
    ordering_fields = ["name", "province", "city", "created_at", "updated_at"]
    ordering = ["name"]

    def get_permissions(self):
        if self.action in {"list", "retrieve"}:
            return [AllowAny()]
        return super().get_permissions()

    def get_serializer_class(self):
        if self.action == "list":
            return HospitalListSerializer
        return HospitalDetailSerializer

    def perform_destroy(self, instance):
        if instance.recipients.filter(deleted_at__isnull=True).exists():
            raise ValidationError({"detail": "Cannot delete hospital while recipients are linked to it."})
        super().perform_destroy(instance)
