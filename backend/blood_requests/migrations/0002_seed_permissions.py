from django.db import migrations


def seed_blood_request_permissions(apps, schema_editor):
    Permission = apps.get_model("core", "Permission")
    RolePermission = apps.get_model("accounts", "RolePermission")

    actions = ["view", "add", "change", "delete"]
    permissions = {}

    for action in actions:
        permission, _ = Permission.objects.get_or_create(
            module="blood_requests",
            action=action,
            defaults={"description": f"Can {action} blood requests"},
        )
        permissions[action] = permission

    role_actions = {
        "admin": actions,
        "receptionist": ["view", "add", "change"],
        "viewer": ["view"],
    }

    for role_name, allowed_actions in role_actions.items():
        for action in allowed_actions:
            RolePermission.objects.get_or_create(
                role_name=role_name,
                permission=permissions[action],
            )


def remove_blood_request_permissions(apps, schema_editor):
    Permission = apps.get_model("core", "Permission")
    RolePermission = apps.get_model("accounts", "RolePermission")

    request_permissions = Permission.objects.filter(module="blood_requests")
    RolePermission.objects.filter(permission__in=request_permissions).delete()
    request_permissions.delete()


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0001_initial"),
        ("blood_requests", "0001_initial"),
        ("core", "0006_alter_permission_module"),
    ]

    operations = [
        migrations.RunPython(seed_blood_request_permissions, remove_blood_request_permissions),
    ]
