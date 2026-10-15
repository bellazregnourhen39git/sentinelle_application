import sys, os
sys.path.insert(0, r"c:\Users\MSI\sentinelle_application")
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Sentinelle.settings')
import django
django.setup()

from api.models import QuestionnaireSession
from api.analytics import SentinelleAnalytics, SECTION_QUESTIONS

qs = QuestionnaireSession.objects.filter(is_valid=True)

for sec_id, q_list in SECTION_QUESTIONS.items():
    print(f"\n--- Checking Section {sec_id} ---")
    for code, label, related, field, choices, chart_type in q_list:
        try:
            dist = SentinelleAnalytics._char_dist(qs, related, field, choices)
            has_count = any(d['count'] > 0 for d in dist)
            print(f"  OK: {code} ({related}__{field}) -> has_count={has_count}")
        except Exception as e:
            print(f"  ERROR: {code} ({related}__{field}) -> {e}")
