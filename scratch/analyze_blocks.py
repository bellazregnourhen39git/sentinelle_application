import re

with open('frontend/src/components/QuestionnaireForm.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# find all question rendering blocks
# e.g. <FieldLabel ... /> followed by component
fieldlabel_blocks = re.findall(r'<FieldLabel[^>]+>(?:(?!<FieldLabel)[\s\S])*?(?=<FieldLabel|const RAW_SECTIONS|<\/div>\s*\)\s*;\s*const)', text)
print(f"Found {len(fieldlabel_blocks)} blocks")
for b in fieldlabel_blocks[:20]:
    first_line = b.strip().split('\n')[0]
    comp = re.findall(r'<([A-Z][a-zA-Z0-9]+|input|select)', b)
    print(f"Block: {first_line[:60]} -> Components: {comp}")
