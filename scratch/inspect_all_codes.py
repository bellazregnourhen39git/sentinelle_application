import re

with open('frontend/src/components/QuestionnaireForm.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# find all FieldLabel code="..."
codes = re.findall(r'<FieldLabel\s+code=["\']([^"\']+)["\']', text)
print(f"Found {len(codes)} FieldLabel codes:")
print(codes)
