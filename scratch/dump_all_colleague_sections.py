import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

from compare_sections_fast import parse_sections_fast

cur_secs = parse_sections_fast('frontend/src/components/QuestionnaireForm.jsx', False)
col_secs = parse_sections_fast('scratch/colleague/QuestionnaireForm_clean.jsx', False)

for sec_name in sorted(cur_secs.keys()):
    print(f"\n=======================================================")
    print(f"=== SECTION: {sec_name.upper()} ===")
    print(f"=======================================================")
    print(">>> COLLEAGUE VERSION <<<")
    print(col_secs.get(sec_name, 'NOT FOUND'))
