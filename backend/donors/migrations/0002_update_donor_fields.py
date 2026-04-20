from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("donors", "0001_initial"),
    ]

    operations = [
        migrations.RemoveIndex(
            model_name="donor",
            name="donors_emergency_phone_idx",
        ),
        migrations.RenameField(
            model_name="donor",
            old_name="address",
            new_name="permanent_address",
        ),
        migrations.AddField(
            model_name="donor",
            name="age",
            field=models.PositiveSmallIntegerField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="donor",
            name="local_address",
            field=models.TextField(blank=True, null=True),
        ),
        migrations.RemoveField(
            model_name="donor",
            name="emergency_contact_name",
        ),
        migrations.RemoveField(
            model_name="donor",
            name="emergency_contact_phone",
        ),
        migrations.RemoveField(
            model_name="donor",
            name="notes",
        ),
    ]
