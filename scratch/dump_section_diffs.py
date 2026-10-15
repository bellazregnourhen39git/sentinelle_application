import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('scratch/colleague/QuestionnaireForm.txt', 'r', encoding='utf-8') as f:
    col_raw = f.read()

col_jsx = re.sub(r'// --- PAGE \d+ ---\n', '', col_raw)

# Let's inspect sections in colleague
from compare_sections_fast import parse_sections_fast
col_secs = parse_sections_fast('scratch/colleague/QuestionnaireForm.txt', True)
cur_secs = parse_sections_fast('frontend/src/components/QuestionnaireForm.jsx', False)

for s in ['section_a', 'section_b', 'section_c', 'section_g', 'section_i', 'section_m', 'section_p', 'section_s', 'section_t', 'section_u', 'section_v']:
    print(f"\n{'='*30} {s.upper()} {'='*30}")
    print("--- COLLEAGUE ---")
    print(col_secs.get(s, '')[:1200])
    print("\n--- CURRENT ---")
    print(cur_secs.get(s, '')[:800])
