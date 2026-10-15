import sys, os
sys.path.insert(0, r"c:\Users\MSI\sentinelle_application")
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Sentinelle.settings')
import django
django.setup()

from api.models import QuestionnaireSession
from api.analytics import SentinelleAnalytics, SECTION_QUESTIONS

qs = QuestionnaireSession.objects.filter(is_valid=True)
print("Total valid sessions:", qs.count())

for s in ['A', 'B', 'C', 'D', 'E', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'Z']:
    res = SentinelleAnalytics.get_section_questions_stats(s, qs)
    q_count = len(res.get('questions', []))
    print(f"Section {s}: questions count = {q_count}")
    if q_count > 0:
        for q in res['questions']:
            nonzero = [d for d in q['distribution'] if d['count'] > 0]
            print(f"  - {q['code']}: {nonzero}")
