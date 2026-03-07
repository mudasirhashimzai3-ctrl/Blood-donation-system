from datetime import timedelta

from django.utils import timezone
from rest_framework import serializers

from blood_requests.models import BloodRequest
from reports.models import ReportExportJob


class ReportFiltersSerializer(serializers.Serializer):
    GROUP_BY_CHOICES = [("day", "day"), ("week", "week"), ("month", "month")]

    date_from = serializers.DateTimeField(required=False)
    date_to = serializers.DateTimeField(required=False)
    group_by = serializers.ChoiceField(choices=GROUP_BY_CHOICES, required=False, default="day")
    hospital_id = serializers.IntegerField(required=False, min_value=1)
    city = serializers.CharField(required=False, allow_blank=False)
    blood_group = serializers.ChoiceField(choices=BloodRequest.BLOOD_GROUP_CHOICES, required=False)
    request_type = serializers.ChoiceField(choices=BloodRequest.REQUEST_TYPE_CHOICES, required=False)
    priority = serializers.ChoiceField(choices=BloodRequest.PRIORITY_CHOICES, required=False)
    emergency_only = serializers.BooleanField(required=False, default=False)
    status = serializers.CharField(required=False, allow_blank=False)
    search = serializers.CharField(required=False, allow_blank=True, default="")
    ordering = serializers.CharField(required=False, allow_blank=True, default="")
    page = serializers.IntegerField(required=False, default=1, min_value=1)
    page_size = serializers.IntegerField(required=False, default=25, min_value=1, max_value=100)

    def validate(self, attrs):
        now = timezone.localtime()
        default_date_to = now.replace(hour=23, minute=59, second=59, microsecond=0)
        default_date_from = (default_date_to - timedelta(days=30)).replace(
            hour=0, minute=0, second=0, microsecond=0
        )

        date_to = attrs.get("date_to") or default_date_to
        date_from = attrs.get("date_from") or default_date_from

        if date_from > date_to:
            raise serializers.ValidationError({"date_from": "date_from must be before date_to."})

        if date_to - date_from > timedelta(days=365):
            raise serializers.ValidationError(
                {"date_to": "Maximum synchronous analytics range is 365 days."}
            )

        attrs["date_from"] = date_from
        attrs["date_to"] = date_to
        return attrs


class ReportExportJobSerializer(serializers.ModelSerializer):
    owner_id = serializers.IntegerField(source="owner.id", read_only=True)
    artifact_url = serializers.SerializerMethodField()

    class Meta:
        model = ReportExportJob
        fields = [
            "id",
            "owner_id",
            "report_type",
            "file_format",
            "status",
            "filters",
            "include_sections",
            "artifact_url",
            "error_message",
            "started_at",
            "completed_at",
            "expires_at",
            "row_count",
            "created_at",
            "updated_at",
        ]

    def get_artifact_url(self, obj):
        request = self.context.get("request")
        if not obj.artifact:
            return None
        url = obj.artifact.url
        return request.build_absolute_uri(url) if request else url


class ReportExportCreateSerializer(serializers.Serializer):
    REPORT_TYPE_CHOICES = ReportExportJob.REPORT_TYPE_CHOICES
    FILE_FORMAT_CHOICES = ReportExportJob.FILE_FORMAT_CHOICES

    report_type = serializers.ChoiceField(choices=REPORT_TYPE_CHOICES)
    format = serializers.ChoiceField(choices=FILE_FORMAT_CHOICES)
    filters = serializers.DictField(required=False, default=dict)
    include_sections = serializers.ListField(
        child=serializers.CharField(), required=False, default=list
    )

    def validate_filters(self, value):
        serializer = ReportFiltersSerializer(data=value)
        serializer.is_valid(raise_exception=True)
        return serializer.validated_data

    def create(self, validated_data):
        request = self.context["request"]
        normalized_filters = {}
        for key, value in validated_data.get("filters", {}).items():
            if hasattr(value, "isoformat"):
                normalized_filters[key] = value.isoformat()
            else:
                normalized_filters[key] = value
        return ReportExportJob.objects.create(
            owner=request.user,
            report_type=validated_data["report_type"],
            file_format=validated_data["format"],
            filters=normalized_filters,
            include_sections=validated_data.get("include_sections", []),
            status="queued",
        )
