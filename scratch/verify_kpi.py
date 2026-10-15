import os
import sys
sys.path.insert(0, os.path.abspath('.'))
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Sentinelle.settings')
django.setup()

from api.models import QuestionnaireSession, Governorate
from api.analytics import SentinelleAnalytics

sessions = QuestionnaireSession.objects.filter(is_valid=True)
data_nat = SentinelleAnalytics.get_homepage_stats(sessions, 'Secteur National')
print('National Headline n_schools:', data_nat['headline']['n_schools'])
print('National KPIs:', data_nat['kpis'])

gov_sfax = Governorate.objects.filter(name='Sfax').first()
data_sfax = SentinelleAnalytics.get_homepage_stats(sessions.filter(governorate=gov_sfax), 'Gouvernorat de Sfax', scope_type='gouvernorate', target_gov=gov_sfax)
print('Sfax Headline n_schools:', data_sfax['headline']['n_schools'])
print('Sfax KPIs:', data_sfax['kpis'])
