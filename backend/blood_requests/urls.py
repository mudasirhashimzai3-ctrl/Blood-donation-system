from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import BloodRequestViewSet

app_name = "blood_requests"

router = DefaultRouter()
router.register(r"", BloodRequestViewSet, basename="blood-request")

urlpatterns = [
    path("", include(router.urls)),
]
