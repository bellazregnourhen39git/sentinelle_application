import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('scratch/colleague/QuestionnaireForm_clean.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

for m in re.finditer(r'isEditMode[\s\S]{1,400}', text):
    print("--- isEditMode match ---")
    print(m.group(0)[:300])
