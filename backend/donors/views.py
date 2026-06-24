from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, parsers, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from accounts.models import normalize_role_name
from blood_requests.models import BloodRequest
from blood_requests.serializers import BloodRequestListSerializer
from core.pagination import StandardResultsSetPagination
from core.permissions import PermissionMixin
from rest_framework.exceptions import PermissionDenied, ValidationError

from donations.models import Donation
from donations.serializers import DonationListSerializer
from donations.services.actionable import filter_actionable_donations
from .models import Donor
from .serializers import (
    AvailableDonorSerializer,
    DonorCandidateSerializer,
    DonorDetailSerializer,
    DonorListSerializer,
)
from .services.eligibility import refresh_donor_availability
from .services.matching import ALLOWED_RADIUS_KM, build_donor_candidates, normalize_radius_km


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
        refresh_donor_availability()
        queryset = super().get_queryset()
        role_name = normalize_role_name(getattr(self.request.user, "role_name", None))
        if role_name == "admin":
            return queryset
        if role_name == "donor":
            donor = getattr(self.request.user, "donor", None)
            if donor is None:
                return queryset.none()
            return queryset.filter(pk=donor.pk)
        return queryset.none()

    def get_serializer_class(self):
        if self.action == "list":
            return DonorListSerializer
        if self.action == "candidates":
            return DonorCandidateSerializer
        if self.action == "available":
            return AvailableDonorSerializer
        return DonorDetailSerializer

    @action(detail=False, methods=["get"], url_path="available", permission_module=None)
    def available(self, request):
        role_name = normalize_role_name(getattr(request.user, "role_name", None))
        if role_name != "recipient":
            raise PermissionDenied("Only recipient users can search available donors.")

        recipient = getattr(request.user, "recipient", None)
        if recipient is None:
            raise ValidationError({"detail": "Recipient profile is not configured for this account."})

        blood_group = request.query_params.get("blood_group") or recipient.required_blood_group
        if not blood_group:
            raise ValidationError({"blood_group": "Blood group is required."})

        valid_groups = {value for value, _label in Donor.BLOOD_GROUP_CHOICES}
        if blood_group not in valid_groups:
            raise ValidationError({"blood_group": "Invalid blood group."})

        raw_radius = request.query_params.get("radius_km")
        if raw_radius and normalize_radius_km(raw_radius, default=-1) not in ALLOWED_RADIUS_KM:
            raise ValidationError({"radius_km": "Radius must be one of 10, 20, 50, or 100 KM."})
        radius_km = normalize_radius_km(raw_radius, default=10)

        hospital = recipient.hospital
        if hospital is None or hospital.latitude is None or hospital.longitude is None:
            raise ValidationError(
                {"hospital": "Recipient hospital with coordinates is required to calculate donor distance."}
            )

        candidates = build_donor_candidates(
            blood_group=blood_group,
            origin_lat=hospital.latitude,
            origin_lon=hospital.longitude,
            radius_km=radius_km,
        )
        page = self.paginate_queryset(candidates)
        serializer = AvailableDonorSerializer(page if page is not None else candidates, many=True)
        if page is not None:
            return self.get_paginated_response(serializer.data)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=False, methods=["get"], url_path="candidates", permission_module=None)
    def candidates(self, request):
        role_name = normalize_role_name(getattr(request.user, "role_name", None))
        if role_name not in {"admin", "recipient"}:
            raise PermissionDenied("Only admin and recipient users can search donor candidates.")

        blood_request_id = request.query_params.get("blood_request_id")
        if not blood_request_id:
            raise ValidationError({"blood_request_id": "Blood request is required."})

        request_queryset = BloodRequest.objects.filter(
            pk=blood_request_id,
            deleted_at__isnull=True,
            is_active=True,
        )
        if role_name == "recipient":
            recipient = getattr(request.user, "recipient", None)
            if recipient is None:
                raise ValidationError({"detail": "Recipient profile is not configured for this account."})
            request_queryset = request_queryset.filter(recipient=recipient)

        try:
            blood_request = request_queryset.get()
        except (BloodRequest.DoesNotExist, ValueError) as exc:
            raise ValidationError({"blood_request_id": "Active blood request not found."}) from exc

        blood_group = request.query_params.get("blood_group") or blood_request.blood_group
        valid_groups = {value for value, _label in Donor.BLOOD_GROUP_CHOICES}
        if blood_group not in valid_groups:
            raise ValidationError({"blood_group": "Invalid blood group."})

        raw_radius = request.query_params.get("radius_km")
        if raw_radius and normalize_radius_km(raw_radius, default=-1) not in ALLOWED_RADIUS_KM:
            raise ValidationError({"radius_km": "Radius must be one of 10, 20, 50, or 100 KM."})
        radius_km = normalize_radius_km(raw_radius, default=10)

        candidates = build_donor_candidates(
            blood_group=blood_group,
            origin_lat=blood_request.location_lat,
            origin_lon=blood_request.location_lon,
            radius_km=radius_km,
        )
        page = self.paginate_queryset(candidates)
        serializer = DonorCandidateSerializer(page if page is not None else candidates, many=True)
        if page is not None:
            return self.get_paginated_response(serializer.data)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(
        detail=False,
        methods=["get", "patch"],
        url_path="me",
        permission_classes=[IsAuthenticated],
        permission_module=None,
    )
    def me(self, request):
        role_name = normalize_role_name(getattr(request.user, "role_name", None))
        if role_name != "donor":
            raise PermissionDenied("Only donor users can access this endpoint.")

        donor = getattr(request.user, "donor", None)
        if donor is None:
            return Response(
                {"detail": "Donor profile is not configured for this account."},
                status=status.HTTP_404_NOT_FOUND,
            )
        if request.method.lower() == "patch":
            serializer = DonorDetailSerializer(
                donor,
                data=request.data,
                partial=True,
                context={"request": request},
            )
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
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

        candidate_donations = filter_actionable_donations(
            Donation.objects.select_related("request", "request__hospital", "request__recipient")
            .filter(
                donor=donor,
                status="pending",
                deleted_at__isnull=True,
                request__deleted_at__isnull=True,
                request__is_active=True,
                request__status="pending",
            )
            .order_by("-request__is_emergency", "request__response_deadline", "-created_at")
        )
        donation_payload = DonationListSerializer(
            candidate_donations,
            many=True,
            context={"request": request},
        ).data
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
                "donation_requests": donation_payload,
                "history_count": history_count,
                "unread_notifications": unread_notifications,
            },
            status=status.HTTP_200_OK,
        )
