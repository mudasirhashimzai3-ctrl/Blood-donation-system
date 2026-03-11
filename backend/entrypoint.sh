#!/bin/sh
set -e

: "${PORT:=8000}"
: "${GUNICORN_WORKERS:=3}"
: "${GUNICORN_TIMEOUT:=120}"

python manage.py migrate --noinput
python manage.py collectstatic --noinput

if [ "${CREATE_SUPERUSER:-false}" = "true" ]; then
  if [ -n "${DJANGO_SUPERUSER_USERNAME:-}" ] && [ -n "${DJANGO_SUPERUSER_PASSWORD:-}" ]; then
    python manage.py shell <<'PY'
from django.contrib.auth import get_user_model
import os

User = get_user_model()
username = os.environ.get("DJANGO_SUPERUSER_USERNAME")
email = os.environ.get("DJANGO_SUPERUSER_EMAIL") or ""
password = os.environ.get("DJANGO_SUPERUSER_PASSWORD")

if username and password:
    if not User.objects.filter(username=username).exists():
        User.objects.create_superuser(username=username, email=email, password=password)
        print("Created default superuser.")
    else:
        print("Default superuser already exists.")
PY
  else
    echo "CREATE_SUPERUSER=true but DJANGO_SUPERUSER_USERNAME/PASSWORD not set. Skipping."
  fi
fi

exec gunicorn foundation.asgi:application \
  -k uvicorn.workers.UvicornWorker \
  --bind "0.0.0.0:${PORT}" \
  --workers "${GUNICORN_WORKERS}" \
  --timeout "${GUNICORN_TIMEOUT}"
