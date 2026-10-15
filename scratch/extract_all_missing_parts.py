import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('scratch/old_QuestionnaireForm.jsx', 'r', encoding='utf-8') as f:
    old = f.read()

# 1. Print FieldLabel definition in old file
m = re.search(r'const\s+FieldLabel\s*=\s*[\s\S]*?(?=\n\s*(?:const|function|\/\/\s*───))', old)
if m:
    print("=== OLD FieldLabel ===")
    print(m.group(0))

# 2. Print generateRandomData function
m = re.search(r'const\s+generateRandomData\s*=\s*[\s\S]*?(?=\n\s*(?:const|function|\/\/\s*───|const\s+SECTIONS|const\s+RAW_SECTIONS))', old)
if m:
    print("\n=== OLD generateRandomData ===")
    print(m.group(0)[:3000])

# 3. Print progress navigation bar / section dots
m = re.search(r'\{\/\*.*?(?:Progress|Navigation|Dots|Pills).*?\*\/\}[\s\S]*?(?=\n\s*<motion\.div|\n\s*<div\s+className=["\']p-)', old, re.I)
if not m:
    # search around SECTIONS.map in return
    m = re.search(r'(?:<div className=["\'][^"\']*flex[^"\']*gap[^"\']*["\']>[\s\S]*?SECTIONS\.map[\s\S]*?<\/div>)', old)
if m:
    print("\n=== OLD PROGRESS BAR / SECTION DOTS ===")
    print(m.group(0))
else:
    # Let's search inside the old file for where step navigation or dots were
    for match in re.finditer(r'SECTIONS\.map\(\(sec,\s*idx\)[\s\S]*?\)', old):
        print("\n=== SECTIONS.map MATCH ===")
        print(match.group(0)[:800])
