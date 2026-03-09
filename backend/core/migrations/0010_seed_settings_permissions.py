from django.db import migrations


def seed_settings_permissions(apps, schema_editor):
    Permission = apps.get_model("core", "Permission")
    RolePermission = apps.get_model("accounts", "RolePermission")

    view_permission, _ = Permission.objects.get_or_create(
        module="settings",
        action="view",
        defaults={"description": "Can view settings"},
    )
    change_permission, _ = Permission.objects.get_or_create(
        module="settings",
        action="change",
        defaults={"description": "Can change settings"},
    )

    RolePermission.objects.get_or_create(role_name="admin", permission=view_permission)
    RolePermission.objects.get_or_create(role_name="admin", permission=change_permission)

    RolePermission.objects.get_or_create(role_name="receptionist", permission=view_permission)
    RolePermission.objects.get_or_create(role_name="viewer", permission=view_permission)


def remove_settings_permissions(apps, schema_editor):
    Permission = apps.get_model("core", "Permission")
    RolePermission = apps.get_model("accounts", "RolePermission")

    permissions = Permission.objects.filter(module="settings", action__in=["view", "change"])
    RolePermission.objects.filter(permission__in=permissions).delete()
    permissions.delete()


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0001_initial"),
        ("core", "0009_setting_audit_log"),
    ]

    operations = [
        migrations.RunPython(seed_settings_permissions, remove_settings_permissions),
    ]
