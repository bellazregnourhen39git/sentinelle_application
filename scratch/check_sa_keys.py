import sys, os
sys.path.insert(0, r"c:\Users\MSI\sentinelle_application")
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Sentinelle.settings')
import django
django.setup()

from api.models import SectionA, SectionC, SectionG, SectionN, SectionP, SectionQ, SectionR, SectionS, SectionT, SectionU, SectionV

sa = SectionA.objects.first()
if sa:
    print("SectionA activities_frequency:", sa.activities_frequency)
    print("SectionA family_relationship_satisfaction:", sa.family_relationship_satisfaction)
