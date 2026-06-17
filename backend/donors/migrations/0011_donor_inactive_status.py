# Generated manually for donor eligibility status syncing

from django.db import migrations, models


def normalize_statuses(apps, schema_editor):
    Donor = apps.get_model("donors", "Donor")
    Donor.objects.exclude(status="active").update(status="inactive")


class Migration(migrations.Migration):

    dependencies = [
        ("donors", "0010_alter_donor_phone"),
    ]

    operations = [
        migrations.AlterField(
            model_name="donor",
            name="status",
            field=models.CharField(
                choices=[("active", "Active"), ("inactive", "Inactive")],
                default="active",
                max_length=20,
            ),
        ),
        migrations.RunPython(normalize_statuses, migrations.RunPython.noop),
    ]
