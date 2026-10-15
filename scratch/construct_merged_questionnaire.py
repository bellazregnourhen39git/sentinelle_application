import sys
import os

sys.stdout.reconfigure(encoding='utf-8')

# Let's read both current QuestionnaireForm.jsx and colleague's version
with open('frontend/src/components/QuestionnaireForm.jsx', 'r', encoding='utf-8') as f:
    current_content = f.read()

print("Current content loaded, length:", len(current_content))
