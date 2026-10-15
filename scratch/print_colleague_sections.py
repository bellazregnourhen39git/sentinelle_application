import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('scratch/colleague/models.py (1).txt', 'r', encoding='utf-8') as f:
    raw = f.read()

text = re.sub(r'// --- PAGE \d+ ---\n', '', raw)

class_matches = list(re.finditer(r'^(class\s+[A-Za-z0-9_]+.*?:)', text, re.M))

for i, m in enumerate(class_matches):
    start = m.start()
    end = class_matches[i+1].start() if i+1 < len(class_matches) else len(text)
    cls_block = text[start:end].strip()
    cls_name = re.match(r'class\s+([A-Za-z0-9_]+)', cls_block).group(1)
    
    if cls_name.startswith('Section'):
        print(f"\n==================== {cls_name} ====================")
        print(cls_block)
