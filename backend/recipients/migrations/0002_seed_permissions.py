from django.db import migrations


def seed_recipient_permissions(apps, schema_editor):
    Permission = apps.get_model("core", "Permission")
    RolePermission = apps.get_model("accounts", "RolePermission")

    actions = ["view", "add", "change", "delete"]
    permissions = {}

    for action in actions:
        permission, _ = Permission.objects.get_or_create(
            module="recipients",
            action=action,
            defaults={"description": f"Can {action} recipients"},
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


def remove_recipient_permissions(apps, schema_editor):
    Permission = apps.get_model("core", "Permission")
    RolePermission = apps.get_model("accounts", "RolePermission")

    recipient_permissions = Permission.objects.filter(module="recipients")
    RolePermission.objects.filter(permission__in=recipient_permissions).delete()
    recipient_permissions.delete()


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0001_initial"),
        ("core", "0004_alter_permission_module"),
        ("recipients", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed_recipient_permissions, remove_recipient_permissions),
    ]
