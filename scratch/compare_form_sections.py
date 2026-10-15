import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('frontend/src/components/QuestionnaireForm.jsx', 'r', encoding='utf-8') as f:
    cur_jsx = f.read()

with open('scratch/colleague/QuestionnaireForm.txt', 'r', encoding='utf-8') as f:
    col_raw = f.read()

col_jsx = re.sub(r'// --- PAGE \d+ ---\n', '', col_raw)

# Let's check sections in both:
# E.g. find all { id: 'section_...', letter: '...', ... }
def extract_sections(text):
    # Find all object blocks with id: 'section_...'
    sections = {}
    pattern = re.compile(r"id:\s*'(section_[a-z0-9_]+)'[\s\S]*?letter:\s*'([A-Z0-9_]+)'[\s\S]*?title:\s*'([^']*)'[\s\S]*?content:\s*\(([\s\S]*?)\)\s*,\s*\}", re.M)
    for m in pattern.finditer(text):
        sec_id = m.group(1)
        letter = m.group(2)
        title = m.group(3)
        content = m.group(4)
        sections[letter] = {
            'id': sec_id,
            'title': title,
            'content': content
        }
    return sections

cur_secs = extract_sections(cur_jsx)
col_secs = extract_sections(col_jsx)

print(f"Current sections ({len(cur_secs)}): {list(cur_secs.keys())}")
print(f"Colleague sections ({len(col_secs)}): {list(col_secs.keys())}")

for letter in sorted(set(cur_secs.keys()) | set(col_secs.keys())):
    if letter not in cur_secs:
        print(f"\n[SECTION ONLY IN COLLEAGUE] Section {letter}")
    elif letter not in col_secs:
        print(f"\n[SECTION ONLY IN CURRENT] Section {letter}")
    else:
        c_len = len(cur_secs[letter]['content'])
        col_len = len(col_secs[letter]['content'])
        print(f"\n=== Section {letter}: Current ({c_len} chars) vs Colleague ({col_len} chars) ===")
        # Look for field codes in both
        cur_codes = set(re.findall(r'code=["\']([A-Za-z0-9_.]+)["\']', cur_secs[letter]['content']))
        col_codes = set(re.findall(r'code=["\']([A-Za-z0-9_.]+)["\']', col_secs[letter]['content']))
        
        only_in_col = col_codes - cur_codes
        only_in_cur = cur_codes - col_codes
        if only_in_col:
            print(f"  + Codes ONLY in colleague: {only_in_col}")
        if only_in_cur:
            print(f"  - Codes ONLY in current: {only_in_cur}")
