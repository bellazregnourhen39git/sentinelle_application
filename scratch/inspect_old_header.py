import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scratch/old_QuestionnaireForm.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i in range(2590, 2680):
    if i < len(lines):
        print(f"{i+1:4d}: {lines[i].rstrip()}")
