from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import DonorViewSet

app_name = "donors"

router = DefaultRouter()
router.register(r"", DonorViewSet, basename="donor")

urlpatterns = [
    path("", include(router.urls)),
]

