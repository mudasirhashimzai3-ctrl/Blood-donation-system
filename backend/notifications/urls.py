from django.urls import include, path
from rest_framework.routers import DefaultRouter

from notifications.views import NotificationSmsCallbackView, NotificationViewSet

app_name = "notifications"

router = DefaultRouter()
router.register(r"", NotificationViewSet, basename="notification")

urlpatterns = [
    path("sms-callback/", NotificationSmsCallbackView.as_view(), name="sms-callback"),
    path("", include(router.urls)),
]
