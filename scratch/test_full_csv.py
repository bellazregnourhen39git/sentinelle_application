import sys, os, csv, json, io
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

SECTION_MAPPINGS = [
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

# Build headers
headers = [
    'session_id', 'ecole', 'gouvernorat', 'rapport_classe', 'langue', 'date_creation', 'est_valide',
    'has_risk_behavior', 'tabac', 'vape', 'narguile', 'alcool', 'tranquillisants',
    'cannabis', 'cocaine', 'ecstasy', 'heroine', 'inhalants'
]

section_field_map = {}
for rel_name, model_cls, sec_letter in SECTION_MAPPINGS:
    fields = [f.name for f in model_cls._meta.get_fields() if f.name not in ['id', 'session']]
    section_field_map[rel_name] = fields
    for f in fields:
        headers.append(f"{sec_letter}_{f}")

print(f"Total CSV columns: {len(headers)}")

# Build rows
output = io.StringIO()
writer = csv.writer(output)
writer.writerow(headers)

sessions = QuestionnaireSession.objects.all().select_related('school', 'governorate', 'class_report').prefetch_related(
    *[rel for rel, _, _ in SECTION_MAPPINGS]
)

for s in sessions:
    row = [
        s.id,
        s.school.name if s.school else '',
        s.governorate.name if s.governorate else '',
        s.class_report.establishment_name if s.class_report else '',
        s.language_used,
        s.created_at.strftime('%Y-%m-%d %H:%M') if s.created_at else '',
        s.is_valid,
        s.has_risk_behavior,
        s.tobacco_user,
        s.ecig_user,
        s.hookah_user,
        s.alcohol_user,
        s.tranquilizer_user,
        s.cannabis_user,
        s.cocaine_user,
        s.ecstasy_user,
        s.heroin_user,
        s.inhalant_user,
    ]
    
    for rel_name, model_cls, sec_letter in SECTION_MAPPINGS:
        sec_obj = getattr(s, rel_name, None)
        fields = section_field_map[rel_name]
        for f in fields:
            if not sec_obj:
                row.append('')
            else:
                val = getattr(sec_obj, f, None)
                if val is None:
                    row.append('')
                elif isinstance(val, (dict, list)):
                    row.append(json.dumps(val, ensure_ascii=False))
                elif isinstance(val, bool):
                    row.append('1' if val else '0')
                else:
                    row.append(str(val))
    writer.writerow(row)

csv_str = output.getvalue()
print("Generated CSV length:", len(csv_str))
print("Sample first 300 chars:")
print(csv_str[:300])
