from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, parsers, viewsets
from rest_framework.permissions import IsAuthenticated

from core.pagination import StandardResultsSetPagination
from core.permissions import PermissionMixin

from .models import Donor
from .serializers import DonorDetailSerializer, DonorListSerializer


class DonorViewSet(PermissionMixin, viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    permission_module = "donors"
    queryset = Donor.objects.all().order_by("-created_at")
    serializer_class = DonorDetailSerializer
    pagination_class = StandardResultsSetPagination
    parser_classes = [parsers.MultiPartParser, parsers.FormParser, parsers.JSONParser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ["blood_group", "status"]
    search_fields = [
        "first_name",
        "last_name",
        "phone",
        "email",
        "emergency_contact_name",
        "emergency_contact_phone",
    ]
    ordering_fields = ["first_name", "last_name", "created_at", "updated_at", "last_donation_date"]
    ordering = ["-created_at"]

    def get_serializer_class(self):
        if self.action == "list":
            return DonorListSerializer
        return DonorDetailSerializer
