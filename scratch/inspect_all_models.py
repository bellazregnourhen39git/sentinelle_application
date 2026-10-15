import sys, os
sys.path.insert(0, r"c:\Users\MSI\sentinelle_application")
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Sentinelle.settings')
import django
django.setup()

from api.models import (
    SectionA, SectionB, SectionC, SectionD, SectionE, SectionG,
    SectionH, SectionI, SectionJ, SectionK, SectionL, SectionM,
    SectionN, SectionP, SectionQ, SectionR, SectionS, SectionT,
    SectionU, SectionV, SectionZ
)

models_list = [
    ('A', SectionA), ('B', SectionB), ('C', SectionC), ('D', SectionD), ('E', SectionE),
    ('G', SectionG), ('H', SectionH), ('I', SectionI), ('J', SectionJ), ('K', SectionK),
    ('L', SectionL), ('M', SectionM), ('N', SectionN), ('P', SectionP), ('Q', SectionQ),
    ('R', SectionR), ('S', SectionS), ('T', SectionT), ('U', SectionU), ('V', SectionV),
    ('Z', SectionZ)
]

for sec_code, model_cls in models_list:
    fields = [f.name for f in model_cls._meta.get_fields() if f.name != 'session']
    sample = model_cls.objects.first()
    print(f"\n=== Section {sec_code} ({model_cls.__name__}) ===")
    print("Fields:", fields)
    if sample:
        for f in fields:
            val = getattr(sample, f)
            if isinstance(val, dict):
                print(f"  JSON field '{f}' keys: {list(val.keys())}, sample: {val}")
