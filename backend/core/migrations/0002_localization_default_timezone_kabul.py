import json

from django.db import migrations


def seed_localization_timezone(apps, schema_editor):
    Settings = apps.get_model("core", "Settings")
    row = Settings.objects.filter(setting_key="settings.localization").first()
    if row is None:
        return

    try:
        payload = json.loads(row.setting_value or "{}")
    except (TypeError, json.JSONDecodeError):
        payload = {}

    default_timezone = str(payload.get("default_timezone") or "").strip()
    if default_timezone and default_timezone != "UTC":
        return

    payload["default_timezone"] = "Asia/Kabul"
    row.setting_value = json.dumps(payload)
    row.setting_type = "json"
    row.category = "general"
    row.description = row.description or "Structured settings for localization"
    row.save(update_fields=["setting_value", "setting_type", "category", "description", "updated_at"])


class Migration(migrations.Migration):
    dependencies = [
        ("core", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed_localization_timezone, migrations.RunPython.noop),
    ]
