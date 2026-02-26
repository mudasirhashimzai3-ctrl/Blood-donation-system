from django.db import migrations


def seed_hospital_permissions(apps, schema_editor):
    Permission = apps.get_model("core", "Permission")
    RolePermission = apps.get_model("accounts", "RolePermission")

    actions = ["view", "add", "change", "delete"]
    permissions = {}

    for action in actions:
        permission, _ = Permission.objects.get_or_create(
            module="hospitals",
            action=action,
            defaults={"description": f"Can {action} hospitals"},
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


def remove_hospital_permissions(apps, schema_editor):
    Permission = apps.get_model("core", "Permission")
    RolePermission = apps.get_model("accounts", "RolePermission")

    hospital_permissions = Permission.objects.filter(module="hospitals")
    RolePermission.objects.filter(permission__in=hospital_permissions).delete()
    hospital_permissions.delete()


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0001_initial"),
        ("core", "0005_alter_permission_module"),
        ("hospitals", "0002_hospital_schema_updates"),
    ]

    operations = [
        migrations.RunPython(seed_hospital_permissions, remove_hospital_permissions),
    ]

