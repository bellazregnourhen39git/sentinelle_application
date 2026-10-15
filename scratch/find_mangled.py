import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('scratch/colleague/QuestionnaireForm_clean.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Let's find any suspicious syntax patterns like unclosed brackets or mangled arrays
lines = text.splitlines()
for idx, line in enumerate(lines):
    # Check for quotes on weird positions
    if ",'" in line or ",' " in line or "]['" in line:
        print(f"Line {idx+1}: {line}")
