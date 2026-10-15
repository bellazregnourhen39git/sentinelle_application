import re

with open('frontend/src/components/QuestionnaireForm.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# find RAW_SECTIONS content
raw_sec = re.findall(r"\{\s*id:\s*'([^']+)',\s*letter:\s*'([^']+)',\s*title:\s*'([^']+)',\s*titleAr:\s*'([^']+)'", text)
print(f"Found {len(raw_sec)} sections:")
for s in raw_sec:
    print(s)

