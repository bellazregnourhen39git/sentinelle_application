import sys, os
sys.path.insert(0, r"c:\Users\MSI\sentinelle_application")
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Sentinelle.settings')
import django
django.setup()

from api.models import QuestionnaireSession, SectionN, SectionP, SectionR, SectionQ

print("--- Section N rows ---")
for n in SectionN.objects.all():
    print(f"Session {n.session_id}:")
    print(f"  lifetime_freq_by_type: {n.lifetime_freq_by_type}")
    print(f"  synthetic_cannabinoids: {n.synthetic_cannabinoids}")
    print(f"  synthetic_cathinones: {n.synthetic_cathinones}")

print("\n--- Section P rows ---")
for p in SectionP.objects.all():
    print(f"Session {p.session_id}:")
    print(f"  lifetime_freq: {p.lifetime_freq}")
    print(f"  months_12_freq: {p.months_12_freq}")
    print(f"  fictive: {p.fictive_substance_consumption}")
