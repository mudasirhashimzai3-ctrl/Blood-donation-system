from django.urls import include, path
from rest_framework.routers import DefaultRouter

from donations.views import DonationViewSet

app_name = "donations"

router = DefaultRouter()
router.register(r"", DonationViewSet, basename="donation")

urlpatterns = [
    path("", include(router.urls)),
]
