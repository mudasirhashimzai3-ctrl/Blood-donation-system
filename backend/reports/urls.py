from django.urls import include, path
from rest_framework.routers import DefaultRouter

from reports.views import (
    DashboardOverviewView,
    DonationAnalyticsView,
    EmergencyAnalysisView,
    GeographicDistanceView,
    HospitalPerformanceView,
    ReportExportJobViewSet,
    RequestAnalyticsView,
    SystemPerformanceView,
)

app_name = "reports"

router = DefaultRouter()
router.register(r"exports", ReportExportJobViewSet, basename="report-export")

urlpatterns = [
    path("", include(router.urls)),
    path("dashboard-overview/", DashboardOverviewView.as_view(), name="dashboard-overview"),
    path("request-analytics/", RequestAnalyticsView.as_view(), name="request-analytics"),
    path("donation-analytics/", DonationAnalyticsView.as_view(), name="donation-analytics"),
    path("hospital-performance/", HospitalPerformanceView.as_view(), name="hospital-performance"),
    path("emergency-analysis/", EmergencyAnalysisView.as_view(), name="emergency-analysis"),
    path("geographic-distance/", GeographicDistanceView.as_view(), name="geographic-distance"),
    path("system-performance/", SystemPerformanceView.as_view(), name="system-performance"),
]
