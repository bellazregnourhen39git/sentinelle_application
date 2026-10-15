import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('scratch/colleague/QuestionnaireForm.txt', 'r', encoding='utf-8') as f:
    raw = f.read()

# Filter page markers
col_jsx = re.sub(r'// --- PAGE \d+ ---\n', '', raw)

# Find where QuestionnaireForm component starts
main_comp_idx = col_jsx.find('const QuestionnaireForm = () => {')
if main_comp_idx == -1:
    main_comp_idx = col_jsx.find('export default function QuestionnaireForm')
if main_comp_idx == -1:
    main_comp_idx = col_jsx.find('function QuestionnaireForm')

print("Header & Helper components in Colleague (before main component):")
print(col_jsx[:main_comp_idx])
