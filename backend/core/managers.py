from django.db import models
from django.contrib.auth.models import UserManager as DjangoUserManager


class SoftDeleteManager(models.Manager):
    """Manager that excludes soft-deleted objects by default"""
    def get_queryset(self):
        queryset = super().get_queryset()
        if hasattr(self.model, 'deleted_at'):
            return queryset.filter(deleted_at__isnull=True)
        return queryset


class UserManager(DjangoUserManager):
    """User manager that respects soft deletes and sets defaults for superusers."""

    def get_queryset(self):
        queryset = super().get_queryset()
        if hasattr(self.model, "deleted_at"):
            return queryset.filter(deleted_at__isnull=True)
        return queryset

    def create_superuser(self, username, email=None, password=None, **extra_fields):
        role_name = extra_fields.get("role_name")
        if not role_name:
            extra_fields["role_name"] = "admin"
        return super().create_superuser(username, email=email, password=password, **extra_fields)
