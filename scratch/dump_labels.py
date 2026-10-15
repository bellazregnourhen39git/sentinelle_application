import re

with open('frontend/src/components/QuestionnaireForm.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# find all FieldLabel
matches = re.finditer(r'<FieldLabel\s+([^>]+)>', text)
out = []
for idx, m in enumerate(matches):
    attrs = m.group(1)
    code_match = re.search(r'code=["\']([^"\']+)["\']', attrs)
    code_dyn = re.search(r'code=\{([^}]+)\}', attrs)
    code = code_match.group(1) if code_match else (code_dyn.group(1) if code_dyn else 'UNKNOWN')
    out.append(f"{idx+1}. {code}")

with open('scratch/fieldlabels_out.txt', 'w', encoding='utf-8') as f:
    f.write('\n'.join(out))

print(f"Written {len(out)} fieldlabels to scratch/fieldlabels_out.txt")
