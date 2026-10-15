import sys, os
sys.path.insert(0, r"c:\Users\MSI\sentinelle_application")
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Sentinelle.settings')
import django
django.setup()

from api.models import QuestionnaireSession
from api.analytics import SentinelleAnalytics

qs = QuestionnaireSession.objects.filter(is_valid=True)
print(f"Total valid sessions in DB: {qs.count()}")

all_sections = ['A', 'B', 'C', 'D', 'E', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'Z']

for s in all_sections:
    res = SentinelleAnalytics.get_section_questions_stats(s, qs)
    q_len = len(res.get('questions', []))
    print(f"Section {s}: n_submissions={res.get('n_submissions')}, questions count={q_len}")
