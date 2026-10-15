import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('scratch/old_QuestionnaireForm.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

# Find line where QuestionnaireForm is declared
for i, l in enumerate(lines):
    if 'const QuestionnaireForm =' in l or 'function QuestionnaireForm' in l:
        print(f"QuestionnaireForm declared at line {i+1}")
        
    if 'generateRandomData' in l:
        print(f"generateRandomData at line {i+1}")
        
    if 'brouillon' in l.lower() or 'draft' in l.lower() or 'sauvegarder' in l.lower():
        print(f"Draft/save mention at line {i+1}: {l.strip()[:80]}")
        
    if 'SECTIONS.map' in l or 'dots' in l.lower() or 'step ===' in l:
        print(f"Step/sections at line {i+1}: {l.strip()[:80]}")
