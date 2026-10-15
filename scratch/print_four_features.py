import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scratch/old_QuestionnaireForm.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

def print_range(start, end, title):
    print(f"\n{'='*30} {title} (lines {start}-{end}) {'='*30}")
    for i in range(start-1, min(end, len(lines))):
        print(f"{i+1:4d}: {lines[i].rstrip()}")

print_range(520, 545, "1. DRAFT RESTORE")
print_range(875, 1020, "2. GENERATE RANDOM DATA")
print_range(2680, 2795, "3. FOOTER NAVIGATION, DRAFT, STEP DOTS, AUTO-FILL BUTTON")
