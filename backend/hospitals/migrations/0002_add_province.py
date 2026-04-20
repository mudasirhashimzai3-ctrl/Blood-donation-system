from django.db import migrations, models


PROVINCES = {
    "Badakhshan",
    "Badghis",
    "Baghlan",
    "Balkh",
    "Bamyan",
    "Daykundi",
    "Farah",
    "Faryab",
    "Ghazni",
    "Ghor",
    "Helmand",
    "Herat",
    "Jowzjan",
    "Kabul",
    "Kandahar",
    "Kapisa",
    "Khost",
    "Kunar",
    "Kunduz",
    "Laghman",
    "Logar",
    "Nangarhar",
    "Nimroz",
    "Nuristan",
    "Paktia",
    "Paktika",
    "Panjshir",
    "Parwan",
    "Samangan",
    "Sar-e Pol",
    "Takhar",
    "Urozgan",
    "Wardak",
    "Zabul",
}


def forwards(apps, schema_editor):
    Hospital = apps.get_model("hospitals", "Hospital")
    for hospital in Hospital.objects.all():
        province = hospital.city if hospital.city in PROVINCES else "Kabul"
        Hospital.objects.filter(pk=hospital.pk).update(province=province)


def backwards(apps, schema_editor):
    Hospital = apps.get_model("hospitals", "Hospital")
    for hospital in Hospital.objects.all():
        Hospital.objects.filter(pk=hospital.pk).update(city=hospital.province)


class Migration(migrations.Migration):

    dependencies = [
        ("hospitals", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="hospital",
            name="province",
            field=models.CharField(
                choices=[
                    ("Badakhshan", "Badakhshan"),
                    ("Badghis", "Badghis"),
                    ("Baghlan", "Baghlan"),
                    ("Balkh", "Balkh"),
                    ("Bamyan", "Bamyan"),
                    ("Daykundi", "Daykundi"),
                    ("Farah", "Farah"),
                    ("Faryab", "Faryab"),
                    ("Ghazni", "Ghazni"),
                    ("Ghor", "Ghor"),
                    ("Helmand", "Helmand"),
                    ("Herat", "Herat"),
                    ("Jowzjan", "Jowzjan"),
                    ("Kabul", "Kabul"),
                    ("Kandahar", "Kandahar"),
                    ("Kapisa", "Kapisa"),
                    ("Khost", "Khost"),
                    ("Kunar", "Kunar"),
                    ("Kunduz", "Kunduz"),
                    ("Laghman", "Laghman"),
                    ("Logar", "Logar"),
                    ("Nangarhar", "Nangarhar"),
                    ("Nimroz", "Nimroz"),
                    ("Nuristan", "Nuristan"),
                    ("Paktia", "Paktia"),
                    ("Paktika", "Paktika"),
                    ("Panjshir", "Panjshir"),
                    ("Parwan", "Parwan"),
                    ("Samangan", "Samangan"),
                    ("Sar-e Pol", "Sar-e Pol"),
                    ("Takhar", "Takhar"),
                    ("Urozgan", "Urozgan"),
                    ("Wardak", "Wardak"),
                    ("Zabul", "Zabul"),
                ],
                default="Kabul",
                max_length=50,
            ),
        ),
        migrations.AddIndex(
            model_name="hospital",
            index=models.Index(fields=["province"], name="hospitals_province_0f6c85_idx"),
        ),
        migrations.RunPython(forwards, backwards),
    ]
