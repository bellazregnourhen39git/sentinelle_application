import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('scratch/colleague/QuestionnaireForm_clean.jsx', 'r', encoding='utf-8') as f:
    col_code = f.read()

# Find dynamic question rendering or admin buttons in col_code
m = re.findall(r'dynamicConfigs|editingItem|Pencil|Trash2|Edit2', col_code)
print("Occurrences of dynamic question keywords in colleague JSX:", len(m))

# Let's find where dynamic question render or button appears
for match in re.finditer(r'(?:renderDynamicQuestions|dynamicConfigs|editingItem|Pencil)[\s\S]{1,300}', col_code):
    print("--- MATCH ---")
    print(match.group(0)[:200])
