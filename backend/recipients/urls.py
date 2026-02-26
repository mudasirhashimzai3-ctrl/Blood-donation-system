from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import HospitalViewSet, RecipientViewSet

app_name = "recipients"

router = DefaultRouter()
router.register(r"hospitals", HospitalViewSet, basename="hospital")
router.register(r"", RecipientViewSet, basename="recipient")

urlpatterns = [
    path("", include(router.urls)),
]

