from django.db import migrations

TUNISIA_GOVERNORATES = [
    "Ariana",
    "Béja",
    "Ben Arous",
    "Bizerte",
    "Gabès",
    "Gafsa",
    "Jendouba",
    "Kairouan",
    "Kasserine",
    "Kébili",
    "Le Kef",
    "Mahdia",
    "La Manouba",
    "Médenine",
    "Monastir",
    "Nabeul",
    "Sfax",
    "Sidi Bouzid",
    "Siliana",
    "Sousse",
    "Tataouine",
    "Tozeur",
    "Tunis",
    "Zaghouan",
]

def seed_governorates(apps, schema_editor):
    Governorate = apps.get_model('api', 'Governorate')

    for name in TUNISIA_GOVERNORATES:
        Governorate.objects.get_or_create(name=name)

def reverse_seed(apps, schema_editor):
    pass

class Migration(migrations.Migration):

    dependencies = [
        ('api', '0030_dynamicclassreportfield'),
    ]

    operations = [
        migrations.RunPython(seed_governorates, reverse_code=reverse_seed),
    ]
