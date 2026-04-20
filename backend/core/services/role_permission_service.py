from collections import defaultdict

from django.db import transaction
from rest_framework import serializers

from accounts.models import ROLE_CHOICES, RolePermission
from core.models import Permission

MATRIX_ACTIONS = ("view", "add", "change", "delete", "all")


def get_role_names() -> list[str]:
    return [role for role, _ in ROLE_CHOICES]


def get_permission_modules() -> list[str]:
    return [module for module, _ in Permission.MODULES]


def ensure_permission_catalog() -> None:
    for module in get_permission_modules():
        for action in MATRIX_ACTIONS:
            Permission.objects.get_or_create(
                module=module,
                action=action,
                defaults={
                    "description": f"Can {action} in {module}",
                },
            )


def get_permission_matrix_payload() -> dict:
    ensure_permission_catalog()

    grouped: dict[tuple[str, str], set[str]] = defaultdict(set)
    queryset = RolePermission.objects.select_related("permission")
    for row in queryset:
        grouped[(row.role_name, row.permission.module)].add(row.permission.action)

    matrix = [
        {
            "role_name": role_name,
            "module": module,
            "actions": sorted(actions),
        }
        for (role_name, module), actions in grouped.items()
    ]
    matrix.sort(key=lambda item: (item["role_name"], item["module"]))

    return {
        "roles": get_role_names(),
        "modules": get_permission_modules(),
        "actions": list(MATRIX_ACTIONS),
        "matrix": matrix,
    }


def _validate_guardrail(rows: list[dict]) -> None:
    role_module_map: dict[tuple[str, str], set[str]] = defaultdict(set)
    for row in rows:
        role_module_map[(row["role_name"], row["module"])].update(row["actions"])

    admin_settings_actions = role_module_map.get(("admin", "settings"), set())
    if "all" in admin_settings_actions:
        return

    missing = [action for action in ("view", "change") if action not in admin_settings_actions]
    if missing:
        raise serializers.ValidationError(
            {
                "matrix": (
                    "Admin must retain settings.view and settings.change permissions."
                )
            }
        )


def replace_permission_matrix(rows: list[dict]) -> None:
    ensure_permission_catalog()
    _validate_guardrail(rows)

    with transaction.atomic():
        RolePermission.objects.filter(role_name__in=get_role_names()).delete()

        permission_lookup = {
            (permission.module, permission.action): permission
            for permission in Permission.objects.filter(action__in=MATRIX_ACTIONS)
        }

        create_rows = []
        for row in rows:
            role_name = row["role_name"]
            module = row["module"]
            for action in sorted(set(row["actions"])):
                permission = permission_lookup.get((module, action))
                if not permission:
                    raise serializers.ValidationError(
                        {
                            "matrix": (
                                f"Permission {module}.{action} is not configured."
                            )
                        }
                    )
                create_rows.append(
                    RolePermission(role_name=role_name, permission=permission)
                )

        if create_rows:
            RolePermission.objects.bulk_create(create_rows, ignore_conflicts=True)
