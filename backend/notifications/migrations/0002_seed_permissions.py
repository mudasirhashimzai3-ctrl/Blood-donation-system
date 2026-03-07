from django.db import migrations


def seed_notification_permissions(apps, schema_editor):
    Permission = apps.get_model("core", "Permission")
    RolePermission = apps.get_model("accounts", "RolePermission")

    actions = ["view", "add", "change", "delete"]
    permissions = {}
    for action in actions:
        permission, _ = Permission.objects.get_or_create(
            module="notifications",
            action=action,
            defaults={"description": f"Can {action} notifications"},
        )
        permissions[action] = permission

    role_actions = {
        "admin": actions,
        "receptionist": ["view", "add", "change"],
        "viewer": ["view"],
    }
    for role_name, allowed in role_actions.items():
        for action in allowed:
            RolePermission.objects.get_or_create(role_name=role_name, permission=permissions[action])


def remove_notification_permissions(apps, schema_editor):
    Permission = apps.get_model("core", "Permission")
    RolePermission = apps.get_model("accounts", "RolePermission")

    notifications_permissions = Permission.objects.filter(module="notifications")
    RolePermission.objects.filter(permission__in=notifications_permissions).delete()
    notifications_permissions.delete()


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0001_initial"),
        ("core", "0008_alter_permission_module"),
        ("notifications", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed_notification_permissions, remove_notification_permissions),
    ]
