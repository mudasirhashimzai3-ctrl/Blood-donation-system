from django.urls import include, path
from rest_framework.routers import DefaultRouter

from system_settings.views import SystemSettingsViewSet

app_name = "system_settings"

router = DefaultRouter()
router.register(r"", SystemSettingsViewSet, basename="system-settings")

urlpatterns = [
    path("", include(router.urls)),
]
