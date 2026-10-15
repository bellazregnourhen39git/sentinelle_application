import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scratch/colleague/QuestionnaireForm_clean.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for start, end in [(10, 30), (1220, 1260), (1360, 1400), (2640, 2685)]:
    print(f"\n{'='*30} Lines {start} to {end} {'='*30}")
    for i in range(start-1, min(end, len(lines))):
        print(f"{i+1:4d}: {lines[i].rstrip()}")
