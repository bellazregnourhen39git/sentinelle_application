import os
import sys
sys.path.insert(0, os.path.abspath('.'))
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Sentinelle.settings')
django.setup()

from api.models import Governorate, SchoolEstablishment, ClassReport, QuestionnaireSession
from api.serializers import QuestionnaireSessionSerializer, ClassReportSerializer

def run_verification():
    print("--- Starting Questionnaire Submission Fix Verification ---")
    
    gov, _ = Governorate.objects.get_or_create(name="Ariana_Test")
    
    # 1. Create a ClassReport with NO establishment FK (just free-text establishment_name)
    report_data = {
        'governorate': gov.id,
        'establishment_name': 'Lycée Pilote Test Ariana FreeText',
        'establishment_type': 'PUBLIC',
        'study_level': '1_AS',
        'report_date': '2026-08-12',
    }
    rep_serializer = ClassReportSerializer(data=report_data)
    assert rep_serializer.is_valid(), f"ClassReportSerializer errors: {rep_serializer.errors}"
    class_report = rep_serializer.save()
    print(f"Created ClassReport #{class_report.id}: establishment_name='{class_report.establishment_name}', establishment={class_report.establishment}")
    
    # Check if establishment was auto-created or linked
    assert class_report.establishment is not None, "Expected establishment to be auto-resolved/created"
    print(f"Auto-resolved establishment: {class_report.establishment.name} (id={class_report.establishment.id})")

    # 2. Simulate a ClassReport with establishment explicitly set to None to test Questionnaire fallback
    class_report.establishment = None
    class_report.save(update_fields=['establishment'])
    assert class_report.establishment is None, "Establishment should now be None for fallback test"

    # 3. Submit questionnaire session linked to this class report
    payload = {
        'class_report': class_report.id,
        'language_used': 'FR',
        'section_a': {
            'gender': 'M',
            'birth_year': 2008
        },
        'section_z': {
            'honesty_level': '1'
        }
    }
    
    q_serializer = QuestionnaireSessionSerializer(data=payload)
    is_valid = q_serializer.is_valid()
    if not is_valid:
        print("Validation errors:", q_serializer.errors)
    assert is_valid, f"Expected QuestionnaireSession to be valid, got: {q_serializer.errors}"
    
    session = q_serializer.save()
    print(f"Successfully saved QuestionnaireSession #{session.id}!")
    print(f"Session School: {session.school}")
    print(f"Session Governorate: {session.governorate}")
    print(f"Session Class Report: {session.class_report}")
    
    assert session.school is not None, "Session school should be populated"
    assert session.governorate == gov, "Session governorate should match"

    # Clean up test artifacts
    session.delete()
    class_report.delete()
    if class_report.establishment:
        class_report.establishment.delete()
    gov.delete()
    print("--- Verification Completed Successfully! All tests passed. ---")

if __name__ == '__main__':
    run_verification()
