import sys, os
sys.path.insert(0, r"c:\Users\MSI\sentinelle_application")
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Sentinelle.settings')
import django
django.setup()

from api.models import User, QuestionnaireSession, Governorate, SchoolEstablishment
from rest_framework.test import APIRequestFactory, force_authenticate
from api.views import SectionStatsView, HomepageView

factory = APIRequestFactory()

users = User.objects.all()
print("Users in DB:")
for u in users:
    print(f"  ID: {u.id}, Username: {u.username}, Role: {u.role}, Gov: {u.governorate}, School: {u.establishment}")

# Let's test SectionStatsView for section 'A', 'C', 'G', 'I' with different users
view = SectionStatsView.as_view()

for u in users:
    print(f"\n--- Testing User {u.username} (Role: {u.role}) ---")
    for sec in ['A', 'C', 'I']:
        req = factory.get(f'/api/section-stats/{sec}/', {'scope_type': 'gouvernorate' if u.governorate else 'national', 'scope_id': u.governorate.name if u.governorate else ''})
        force_authenticate(req, user=u)
        res = view(req, section_id=sec)
        print(f"Section {sec}: status={res.status_code}, n_submissions={res.data.get('n_submissions')}, questions_len={len(res.data.get('questions', []))}")
        if len(res.data.get('questions', [])) == 0:
            print("  DATA:", res.data)
