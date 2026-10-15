import sys, os
sys.path.insert(0, r"c:\Users\MSI\sentinelle_application")
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Sentinelle.settings')
import django
django.setup()

from api.models import QuestionnaireSession
from api.analytics import SentinelleAnalytics, SECTION_QUESTIONS

qs = QuestionnaireSession.objects.filter(is_valid=True)
print(f"Total valid sessions in DB: {qs.count()}")

all_sections = ['A', 'B', 'C', 'D', 'E', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'Z']

for s in all_sections:
    res = SentinelleAnalytics.get_section_questions_stats(s, qs)
    q_len = len(res.get('questions', []))
    nonzero_q = sum(1 for q in res.get('questions', []) if any(d['count'] > 0 for d in q['distribution']))
    print(f"Section {s}: total_q={q_len}, questions_with_data={nonzero_q}")
    for q in res.get('questions', []):
        nz = [d for d in q['distribution'] if d['count'] > 0]
        print(f"   [{q['code']}] {q['label']} -> {nz if nz else 'NO DATA'}")
