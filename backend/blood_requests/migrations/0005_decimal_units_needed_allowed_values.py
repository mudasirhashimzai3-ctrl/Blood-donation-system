from decimal import Decimal

from django.db import migrations, models
from django.db.models import Q


def normalize_existing_units(apps, schema_editor):
    BloodRequest = apps.get_model("blood_requests", "BloodRequest")
    for blood_request in BloodRequest.objects.all().only("id", "units_needed"):
        value = blood_request.units_needed
        if value <= 1:
            normalized = Decimal("1.0")
        elif value >= 2:
            normalized = Decimal("2.0")
        else:
            normalized = value
        if value != normalized:
            BloodRequest.objects.filter(pk=blood_request.pk).update(units_needed=normalized)


class Migration(migrations.Migration):
    dependencies = [
        ("blood_requests", "0004_remove_bloodrequest_priority"),
    ]

    operations = [
        migrations.RunPython(normalize_existing_units, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="bloodrequest",
            name="units_needed",
            field=models.DecimalField(decimal_places=1, max_digits=2),
        ),
        migrations.AddConstraint(
            model_name="bloodrequest",
            constraint=models.CheckConstraint(
                check=Q(units_needed__in=[Decimal("1.0"), Decimal("1.5"), Decimal("2.0")]),
                name="blood_request_units_allowed",
            ),
        ),
    ]
