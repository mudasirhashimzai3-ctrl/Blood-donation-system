from django.db import migrations


def seed_report_permissions(apps, schema_editor):
    Permission = apps.get_model("core", "Permission")
    RolePermission = apps.get_model("accounts", "RolePermission")

    actions = ["view", "add", "change", "delete"]
    permission_map = {}

    for action in actions:
        permission, _ = Permission.objects.get_or_create(
            module="reports",
            action=action,
            defaults={"description": f"Can {action} reports"},
        )
        permission_map[action] = permission

    role_actions = {
        "admin": ["view", "add"],
        "receptionist": ["view"],
        "viewer": ["view"],
    }

    for role_name, allowed_actions in role_actions.items():
        for action in allowed_actions:
            RolePermission.objects.get_or_create(
                role_name=role_name,
                permission=permission_map[action],
            )


def remove_report_permissions(apps, schema_editor):
    Permission = apps.get_model("core", "Permission")
    RolePermission = apps.get_model("accounts", "RolePermission")

    report_permissions = Permission.objects.filter(module="reports")
    RolePermission.objects.filter(permission__in=report_permissions).delete()
    report_permissions.delete()


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0001_initial"),
        ("core", "0008_alter_permission_module"),
        ("reports", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed_report_permissions, remove_report_permissions),
    ]
