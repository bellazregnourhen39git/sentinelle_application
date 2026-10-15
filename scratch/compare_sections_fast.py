import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

def parse_sections_fast(file_path, is_pdf_text=False):
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        
    sections = {}
    current_sec = None
    current_lines = []
    
    for line in lines:
        if is_pdf_text and line.startswith('// --- PAGE'):
            continue
            
        m = re.search(r"id:\s*['\"](section_[a-z0-9_]+)['\"]", line)
        if m:
            if current_sec:
                sections[current_sec] = "".join(current_lines)
            current_sec = m.group(1)
            current_lines = [line]
        elif current_sec:
            current_lines.append(line)
            
    if current_sec:
        sections[current_sec] = "".join(current_lines)
        
    return sections

cur_secs = parse_sections_fast('frontend/src/components/QuestionnaireForm.jsx', False)
col_secs = parse_sections_fast('scratch/colleague/QuestionnaireForm.txt', True)

print(f"Current sections: {list(cur_secs.keys())}")
print(f"Colleague sections: {list(col_secs.keys())}")

all_secs = sorted(set(cur_secs.keys()) | set(col_secs.keys()))

for sec in all_secs:
    if sec not in cur_secs:
        print(f"\n[SECTION ONLY IN COLLEAGUE] {sec}")
    elif sec not in col_secs:
        print(f"\n[SECTION ONLY IN CURRENT] {sec}")
    else:
        cur_content = cur_secs[sec]
        col_content = col_secs[sec]
        
        cur_codes = set(re.findall(r'code=["\']([A-Za-z0-9_.]+)["\']', cur_content))
        col_codes = set(re.findall(r'code=["\']([A-Za-z0-9_.]+)["\']', col_content))
        
        cur_inputs = set(re.findall(r'name=["\']([A-Za-z0-9_.]+)["\']', cur_content))
        col_inputs = set(re.findall(r'name=["\']([A-Za-z0-9_.]+)["\']', col_content))
        
        print(f"\n=== {sec} (Cur: {len(cur_content.splitlines())} lines | Col: {len(col_content.splitlines())} lines) ===")
        if col_codes != cur_codes:
            print(f"  Codes in Colleague only: {col_codes - cur_codes}")
            print(f"  Codes in Current only:   {cur_codes - col_codes}")
        if col_inputs != cur_inputs:
            print(f"  Input names in Colleague only: {col_inputs - cur_inputs}")
            print(f"  Input names in Current only:   {cur_inputs - col_inputs}")
