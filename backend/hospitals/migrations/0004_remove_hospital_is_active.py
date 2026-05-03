# Generated manually

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ("hospitals", "0003_rename_hospitals_province_0f6c85_idx_hospitals_provinc_516dff_idx"),
    ]

    operations = [
        migrations.RemoveIndex(
            model_name="hospital",
            name="hospitals_is_acti_ff4c80_idx",
        ),
        migrations.RemoveField(
            model_name="hospital",
            name="is_active",
        ),
    ]
