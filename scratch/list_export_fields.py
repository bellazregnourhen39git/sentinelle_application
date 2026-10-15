import sys, os
sys.path.insert(0, r"c:\Users\MSI\sentinelle_application")
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Sentinelle.settings')
import django
django.setup()

from api.models import (
    QuestionnaireSession, SectionA, SectionB, SectionC, SectionD,
    SectionE, SectionG, SectionH, SectionI, SectionJ, SectionK,
    SectionL, SectionM, SectionN, SectionP, SectionQ, SectionR,
    SectionS, SectionT, SectionU, SectionV, SectionZ
)

session_fields = [
    'id', 'school__name', 'governorate__name', 'language_used', 'is_valid', 'created_at',
    'tobacco_user', 'ecig_user', 'hookah_user', 'alcohol_user', 'tranquilizer_user',
    'cannabis_user', 'cocaine_user', 'ecstasy_user', 'heroin_user', 'inhalant_user',
    'has_risk_behavior'
]

SECTION_MODELS = [
    ('section_a', SectionA, 'A'),
    ('section_b', SectionB, 'B'),
    ('section_c', SectionC, 'C'),
    ('section_d', SectionD, 'D'),
    ('section_e', SectionE, 'E'),
    ('section_g', SectionG, 'G'),
    ('section_h', SectionH, 'H'),
    ('section_i', SectionI, 'I'),
    ('section_j', SectionJ, 'J'),
    ('section_k', SectionK, 'K'),
    ('section_l', SectionL, 'L'),
    ('section_m', SectionM, 'M'),
    ('section_n', SectionN, 'N'),
    ('section_p', SectionP, 'P'),
    ('section_q', SectionQ, 'Q'),
    ('section_r', SectionR, 'R'),
    ('section_s', SectionS, 'S'),
    ('section_t', SectionT, 'T'),
    ('section_u', SectionU, 'U'),
    ('section_v', SectionV, 'V'),
    ('section_z', SectionZ, 'Z'),
]

for rel_name, model_cls, sec_letter in SECTION_MODELS:
    fields = [f.name for f in model_cls._meta.get_fields() if f.name not in ['id', 'session']]
    print(f"\nSection {sec_letter} ({model_cls.__name__}):")
    print("  Fields:", fields)
