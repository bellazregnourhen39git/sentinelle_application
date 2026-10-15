import re

with open('frontend/src/components/QuestionnaireForm.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# find all FieldLabel occurrences
matches = re.finditer(r'<FieldLabel\s+([^>]+)>', text)
for idx, m in enumerate(matches):
    attrs = m.group(1)
    code_match = re.search(r'code=["\']([^"\']+)["\']', attrs)
    code_dyn = re.search(r'code=\{([^}]+)\}', attrs)
    code = code_match.group(1) if code_match else (code_dyn.group(1) if code_dyn else 'UNKNOWN')
    
    opts_match = re.search(r'options=\{([^}]+)\}', attrs)
    opts = opts_match.group(1) if opts_match else None
    
    type_match = re.search(r'questionType=["\']([^"\']+)["\']', attrs)
    qtype = type_match.group(1) if type_match else None
    
    print(f"{idx+1}. Code: {code} | opts: {opts} | type: {qtype}")
