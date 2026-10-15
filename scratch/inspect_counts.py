import os
import sys

sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, os.path.abspath('.'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Sentinelle.settings')

import django
django.setup()

from api.models import QuestionnaireSession, ClassReport, User, Governorate, SchoolEstablishment
from api.analytics import SentinelleAnalytics

print("=== DATABASE TOTALS ===")
print("Total QuestionnaireSession in DB:", QuestionnaireSession.objects.count())
print("Total Valid QuestionnaireSession in DB:", QuestionnaireSession.objects.filter(is_valid=True).count())
print("Total ClassReport in DB:", ClassReport.objects.count())

print("\n=== CLASS REPORTS SUBMISSION COUNTS ===")
for r in ClassReport.objects.all()[:10]:
    print(f"Report ID={r.id}, Est='{r.establishment_name}', Gov='{r.governorate.name if r.governorate else 'None'}', Finalized={r.is_finalized}, CreatedBy={r.created_by.username if r.created_by else 'None'}, Submissions={r.submissions.count()}")

print("\n=== USERS & THEIR SCOPED SESSIONS ===")
for u in User.objects.all()[:10]:
    scoped = SentinelleAnalytics.get_scoped_sessions(u)
    print(f"User {u.username} (Role={u.role}, Gov={u.governorate.name if u.governorate else 'None'}, Est={u.establishment.name if u.establishment else 'None'}) -> Scoped Sessions Count: {scoped.count()}")
