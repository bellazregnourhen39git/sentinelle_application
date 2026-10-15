import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('scratch/colleague/models.py (1).txt', 'r', encoding='utf-8') as f:
    raw = f.read()

# Remove page markers
text = re.sub(r'// --- PAGE \d+ ---\n', '', raw)

# Let's find all class definitions and their text
class_matches = list(re.finditer(r'^(class\s+[A-Za-z0-9_]+.*?:)', text, re.M))

for i, m in enumerate(class_matches):
    start = m.start()
    end = class_matches[i+1].start() if i+1 < len(class_matches) else len(text)
    cls_block = text[start:end].strip()
    cls_name = re.match(r'class\s+([A-Za-z0-9_]+)', cls_block).group(1)
    
    # print class name and first line
    print(f"=== CLASS {cls_name} ({len(cls_block.splitlines())} lines) ===")
    for line in cls_block.splitlines():
        if line.strip().startswith('class ') or '=' in line or 'def ' in line:
            print("  ", line.strip()[:100])
