"""
ASGI config for foundation project.
"""

import os

from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "foundation.settings")

django_asgi_app = get_asgi_application()

try:
    from channels.auth import AuthMiddlewareStack
    from channels.routing import ProtocolTypeRouter, URLRouter

    from notifications.auth import JwtAuthMiddleware
    from notifications.routing import websocket_urlpatterns

    application = ProtocolTypeRouter(
        {
            "http": django_asgi_app,
            "websocket": JwtAuthMiddleware(
                AuthMiddlewareStack(
                    URLRouter(websocket_urlpatterns),
                )
            ),
        }
    )
except Exception:  # pragma: no cover
    application = django_asgi_app
