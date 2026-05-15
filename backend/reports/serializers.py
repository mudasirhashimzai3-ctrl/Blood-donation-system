from datetime import timedelta

from django.utils import timezone
from rest_framework import serializers

from blood_requests.models import BloodRequest


class ReportFiltersSerializer(serializers.Serializer):
    GROUP_BY_CHOICES = [("day", "day"), ("week", "week"), ("month", "month")]

    date_from = serializers.DateTimeField(required=False)
    date_to = serializers.DateTimeField(required=False)
    group_by = serializers.ChoiceField(choices=GROUP_BY_CHOICES, required=False, default="day")
    hospital_id = serializers.IntegerField(required=False, min_value=1)
    city = serializers.CharField(required=False, allow_blank=False)
    blood_group = serializers.ChoiceField(choices=BloodRequest.BLOOD_GROUP_CHOICES, required=False)
    request_type = serializers.ChoiceField(choices=BloodRequest.REQUEST_TYPE_CHOICES, required=False)
    emergency_only = serializers.BooleanField(required=False, default=False)
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
