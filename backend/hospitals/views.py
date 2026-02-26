from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, status, viewsets
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

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
    filterset_fields = ["city", "is_active"]
    search_fields = ["name", "phone", "email", "city", "address"]
    ordering_fields = ["name", "city", "is_active", "created_at", "updated_at"]
    ordering = ["name"]

    def get_serializer_class(self):
        if self.action == "list":
            return HospitalListSerializer
        return HospitalDetailSerializer

    @action(detail=True, methods=["patch"])
    def activate(self, request, pk=None):
        hospital = self.get_object()
        hospital.is_active = True
        hospital.save(update_fields=["is_active", "updated_at"])
        serializer = self.get_serializer(hospital)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=["patch"])
    def deactivate(self, request, pk=None):
        hospital = self.get_object()
        hospital.is_active = False
        hospital.save(update_fields=["is_active", "updated_at"])
        serializer = self.get_serializer(hospital)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def perform_destroy(self, instance):
        if instance.recipients.filter(deleted_at__isnull=True).exists():
            raise ValidationError({"detail": "Cannot delete hospital while recipients are linked to it."})
        super().perform_destroy(instance)
