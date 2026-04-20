from django.db import migrations, models


def forward(apps, schema_editor):
    Recipient = apps.get_model("recipients", "Recipient")
    Recipient.objects.filter(status="pending").update(status="active")


class Migration(migrations.Migration):

    dependencies = [
        ("recipients", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(forward, migrations.RunPython.noop),
        migrations.AlterField(
            model_name="recipient",
            name="status",
            field=models.CharField(choices=[("active", "Active"), ("blocked", "Blocked")], default="active", max_length=20),
        ),
    ]
