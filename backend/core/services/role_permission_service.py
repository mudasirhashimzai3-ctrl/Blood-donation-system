from collections import defaultdict

from django.db import transaction
from rest_framework import serializers

from accounts.models import PUBLIC_ROLE_NAMES, RolePermission, expand_role_names, normalize_role_name
from core.models import Permission

MATRIX_ACTIONS = ("view", "add", "change", "delete", "all")
MANUAL_ROLE_NAMES = ("donor", "recipient")


def get_role_names() -> list[str]:
    return list(PUBLIC_ROLE_NAMES)


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
        public_role = normalize_role_name(row.role_name)
        if public_role not in MANUAL_ROLE_NAMES:
            continue
        grouped[(public_role, row.permission.module)].add(row.permission.action)

    modules = get_permission_modules()
    matrix = []
    for role_name in get_role_names():
        for module in modules:
            if role_name == "admin":
                actions = list(MATRIX_ACTIONS)
            else:
                actions = sorted(grouped.get((role_name, module), set()))

            matrix.append(
                {
                    "role_name": role_name,
                    "module": module,
                    "actions": actions,
                }
            )

    return {
        "roles": get_role_names(),
        "modules": modules,
        "actions": list(MATRIX_ACTIONS),
        "matrix": matrix,
    }


def replace_permission_matrix(rows: list[dict]) -> None:
    ensure_permission_catalog()

    with transaction.atomic():
        RolePermission.objects.filter(role_name__in=expand_role_names(get_role_names())).delete()

        permission_lookup = {
            (permission.module, permission.action): permission
            for permission in Permission.objects.filter(action__in=MATRIX_ACTIONS)
        }

        donor_recipient_map: dict[tuple[str, str], set[str]] = defaultdict(set)
        for row in rows:
            role_name = normalize_role_name(row["role_name"])
            if role_name not in MANUAL_ROLE_NAMES:
                continue
            donor_recipient_map[(role_name, row["module"])].update(row["actions"])

        create_rows = []

        # Admin is always full access.
        for module in get_permission_modules():
            for action in MATRIX_ACTIONS:
                permission = permission_lookup.get((module, action))
                if not permission:
                    raise serializers.ValidationError(
                        {
                            "matrix": (
                                f"Permission {module}.{action} is not configured."
                            )
                        }
                    )
                create_rows.append(RolePermission(role_name="admin", permission=permission))

        # Donor/recipient are configured manually.
        for (role_name, module), actions in donor_recipient_map.items():
            for action in sorted(set(actions)):
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
