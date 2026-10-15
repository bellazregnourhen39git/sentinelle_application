import sys, os
sys.path.insert(0, r"c:\Users\MSI\sentinelle_application")
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Sentinelle.settings')
import django
django.setup()

from api.models import QuestionnaireSession, User
from rest_framework.test import APIRequestFactory, force_authenticate
from api.views import SectionStatsView

factory = APIRequestFactory()
med = User.objects.filter(username='medbouzid1234567').first()

print(f"Testing with practitioner user {med.username}, gov={med.governorate}:")
view = SectionStatsView.as_view()

for sec in ['A', 'B', 'C', 'D', 'E', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'Z']:
    req = factory.get(f'/api/section-stats/{sec}/', {'scope_type': 'gouvernorate', 'scope_id': 'Sfax'})
    force_authenticate(req, user=med)
    res = view(req, section_id=sec)
    q_len = len(res.data.get('questions', []))
    n_sub = res.data.get('n_submissions', 0)
    print(f"  Sec {sec}: n_submissions={n_sub}, q_count={q_len}")
