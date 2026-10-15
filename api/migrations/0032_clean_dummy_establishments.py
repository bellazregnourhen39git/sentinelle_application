from django.db import migrations

def clean_dummy_establishments(apps, schema_editor):
    SchoolEstablishment = apps.get_model('api', 'SchoolEstablishment')
    User = apps.get_model('api', 'User')
    QuestionnaireSession = apps.get_model('api', 'QuestionnaireSession')
    ClassReport = apps.get_model('api', 'ClassReport')

    # Find dummy establishments named 'Lycée Pilote de ...'
    dummies = SchoolEstablishment.objects.filter(name__startswith="Lycée Pilote de ")
    for est in dummies:
        has_users = User.objects.filter(establishment=est).exists()
        has_sessions = QuestionnaireSession.objects.filter(school=est).exists()
        has_reports = ClassReport.objects.filter(establishment=est).exists()
        if not (has_users or has_sessions or has_reports):
            est.delete()

def reverse_code(apps, schema_editor):
    pass

class Migration(migrations.Migration):

    dependencies = [
        ('api', '0031_seed_all_tunisia_governorates'),
    ]

    operations = [
        migrations.RunPython(clean_dummy_establishments, reverse_code=reverse_code),
    ]
