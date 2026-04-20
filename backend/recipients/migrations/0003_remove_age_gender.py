from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("recipients", "0002_remove_pending_status"),
    ]

    operations = [
        migrations.RemoveField(
            model_name="recipient",
            name="age",
        ),
        migrations.RemoveField(
            model_name="recipient",
            name="gender",
        ),
    ]
