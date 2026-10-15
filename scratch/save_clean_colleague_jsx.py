import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('scratch/colleague/QuestionnaireForm.txt', 'r', encoding='utf-8') as f:
    col_raw = f.read()

col_jsx = re.sub(r'// --- PAGE \d+ ---\n', '', col_raw)

# Save clean colleague JSX
with open('scratch/colleague/QuestionnaireForm_clean.jsx', 'w', encoding='utf-8') as f:
    f.write(col_jsx)

print("Saved clean colleague JSX to scratch/colleague/QuestionnaireForm_clean.jsx")
