from django.urls import include, path

from reports.views import (
    DonationAnalyticsView,
    EmergencyAnalysisView,
    GeographicDistanceView,
    HospitalPerformanceView,
    ManagementSummaryPdfView,
    RequestAnalyticsView,
    SystemPerformanceView,
)

app_name = "reports"

urlpatterns = [
    path("request-analytics/", RequestAnalyticsView.as_view(), name="request-analytics"),
    path("donation-analytics/", DonationAnalyticsView.as_view(), name="donation-analytics"),
    path("hospital-performance/", HospitalPerformanceView.as_view(), name="hospital-performance"),
    path("emergency-analysis/", EmergencyAnalysisView.as_view(), name="emergency-analysis"),
    path("geographic-distance/", GeographicDistanceView.as_view(), name="geographic-distance"),
    path("system-performance/", SystemPerformanceView.as_view(), name="system-performance"),
    path("management-summary/pdf/", ManagementSummaryPdfView.as_view(), name="management-summary-pdf"),
]
