import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('frontend/src/components/QuestionnaireForm.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

print(f"Total lines in QuestionnaireForm.jsx: {len(lines)}")

# Let's inspect lines around 1860-1875
for i in range(1855, min(1880, len(lines))):
    print(f"{i+1:4d}: {lines[i].rstrip()}")
