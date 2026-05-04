# Generated manually for blood_request_cleanup

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("blood_requests", "0003_remove_bloodrequest_blood_request_units_min_one"),
    ]

    operations = [
        migrations.RemoveIndex(
            model_name="bloodrequest",
            name="blood_reque_priorit_6b1810_idx",
        ),
        migrations.RemoveField(
            model_name="bloodrequest",
            name="priority",
        ),
    ]
