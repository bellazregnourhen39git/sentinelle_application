import sys, os
sys.path.insert(0, r"c:\Users\MSI\sentinelle_application")
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Sentinelle.settings')
import django
django.setup()

from api.models import QuestionnaireSession, ClassReport

s3463 = QuestionnaireSession.objects.filter(id=3463).first()
if s3463:
    print(f"Session 3463: created_at={s3463.created_at if hasattr(s3463, 'created_at') else None}, report={s3463.class_report}, school={s3463.school}, gov={s3463.governorate}")

cr13 = ClassReport.objects.filter(id=13).first()
if cr13:
    print(f"ClassReport 13: est_name={cr13.establishment_name}, school={cr13.establishment}, gov={cr13.governorate}, created_by={cr13.created_by}")

cr6 = ClassReport.objects.filter(id=6).first()
if cr6:
    print(f"ClassReport 6: est_name={cr6.establishment_name}, school={cr6.establishment}, gov={cr6.governorate}, created_by={cr6.created_by}")
