from django.core.management.base import BaseCommand

from accounts.models import RolePermission
from core.services.role_permission_service import sync_default_role_permissions


class Command(BaseCommand):
    help = "Sync safe default role-permission matrix for admin/donor/recipient."

    def add_arguments(self, parser):
        parser.add_argument(
            "--quiet",
            action="store_true",
            help="Suppress non-error output.",
        )

    def handle(self, *args, **options):
        payload = sync_default_role_permissions()
        if options["quiet"]:
            return

        rows_count = RolePermission.objects.count()
        self.stdout.write(
            self.style.SUCCESS(
                f"Role permissions synced. rows={rows_count}, roles={len(payload['roles'])}, modules={len(payload['modules'])}"
            )
        )
