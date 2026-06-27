from django.db import migrations


def normalize_request_active_state(apps, schema_editor):
    BloodRequest = apps.get_model("blood_requests", "BloodRequest")
    BloodRequest.objects.filter(
        status__in=["pending", "matched"],
        deleted_at__isnull=True,
    ).update(is_active=True)
    BloodRequest.objects.filter(
        status__in=["completed", "cancelled"],
        deleted_at__isnull=True,
    ).update(is_active=False)


class Migration(migrations.Migration):
    dependencies = [
        ("blood_requests", "0005_decimal_units_needed_allowed_values"),
    ]

    operations = [
        migrations.RunPython(normalize_request_active_state, migrations.RunPython.noop),
    ]
