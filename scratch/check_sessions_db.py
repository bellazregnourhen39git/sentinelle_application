import sys, os
sys.path.insert(0, r"c:\Users\MSI\sentinelle_application")
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Sentinelle.settings')
import django
django.setup()

from api.models import QuestionnaireSession, ClassReport

print("--- Questionnaire Sessions ---")
for s in QuestionnaireSession.objects.all():
    print(f"ID={s.id}, valid={s.is_valid}, gov={s.governorate}, school={s.school}, class_report={s.class_report}, created_by={s.class_report.created_by if s.class_report else None}")

print("\n--- Class Reports ---")
for cr in ClassReport.objects.all():
    print(f"ID={cr.id}, est={cr.establishment_name}, school_fk={cr.establishment}, gov={cr.governorate}, created_by={cr.created_by}")
