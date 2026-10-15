import os
import sys

sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, os.path.abspath('.'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Sentinelle.settings')

import django
django.setup()

from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from api.models import Governorate, SchoolEstablishment, SchoolClass, ClassReport, QuestionnaireSession

User = get_user_model()

gov, _ = Governorate.objects.get_or_create(name="Tunis")
school, _ = SchoolEstablishment.objects.get_or_create(name="Lycée Test Submission", governorate=gov)
user, _ = User.objects.get_or_create(username="test_practitioner_sub", defaults={'role': 'PRACTITIONER', 'establishment': school})

report = ClassReport.objects.create(
    governorate=gov,
    establishment=school,
    establishment_name="Lycée Test Submission",
    study_level="1_AS",
    report_date="2026-08-14",
    students_present=20,
    created_by=user
)

client = APIClient()
client.force_authenticate(user=user)

payload = {
    "class_report": report.id,
    "language_used": "FR",
    "section_a": { "gender": "M", "birth_year": 2008, "birth_month": 5 },
    "section_c": { "lifetime_freq": "1" },
    "extra_answers": {}
}

response = client.post('/api/questionnaire/submit/', payload, format='json')
print("Status code:", response.status_code)
if response.status_code == 201:
    session_id = response.data['id']
    session = QuestionnaireSession.objects.get(pk=session_id)
    print(f"Success! QuestionnaireSession created ID={session.id}, Gov={session.governorate.name}, School={session.school.name}")
else:
    print("Error response:", response.data)
