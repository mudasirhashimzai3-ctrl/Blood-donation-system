from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("recipients", "0006_recipient_blood_group_optional"),
    ]

    operations = [
        migrations.RemoveIndex(
            model_name="recipient",
            name="recipients_status_6aa2a4_idx",
        ),
        migrations.RemoveField(
            model_name="recipient",
            name="status",
        ),
    ]
