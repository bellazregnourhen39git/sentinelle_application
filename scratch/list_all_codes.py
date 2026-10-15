import re

with open('frontend/src/components/QuestionnaireForm.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Find all code="..." or code={'...'} in text
all_codes = re.findall(r'code=["\']([^"\']+)["\']', text)
unique_codes = sorted(list(set(all_codes)))
print(f"Total unique codes in JSX: {len(unique_codes)}")
for c in unique_codes:
    print(c)
