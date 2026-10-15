import sys
import os
import re

sys.stdout.reconfigure(encoding='utf-8')

print("="*80)
print("COMPARING models.py")
print("="*80)

with open('api/models.py', 'r', encoding='utf-8') as f:
    cur_models = f.read()

with open('scratch/colleague/models_reconstructed.py', 'r', encoding='utf-8') as f:
    col_models = f.read()

# Let's extract all class names and their contents
def split_classes(code):
    classes = {}
    current_name = "HEADER"
    current_body = []
    for line in code.splitlines():
        m = re.match(r'^class\s+([A-Za-z0-9_]+)', line)
        if m:
            classes[current_name] = "\n".join(current_body)
            current_name = m.group(1)
            current_body = [line]
        else:
            current_body.append(line)
    classes[current_name] = "\n".join(current_body)
    return classes

cur_classes = split_classes(cur_models)
col_classes = split_classes(col_models)

print(f"Current classes: {list(cur_classes.keys())}")
print(f"Colleague classes: {list(col_classes.keys())}")

for cname, col_body in col_classes.items():
    if cname == "HEADER":
        continue
    if cname not in cur_classes:
        print(f"\n[NEW CLASS IN COLLEAGUE]: {cname}")
        print(col_body[:500])
    else:
        cur_body = cur_classes[cname]
        # Let's find fields in both
        cur_fields = re.findall(r'^\s+([a-zA-Z0-9_]+)\s*=\s*(.*)', cur_body, re.M)
        col_fields = re.findall(r'^\s+([a-zA-Z0-9_]+)\s*=\s*(.*)', col_body, re.M)
        
        cur_f_dict = dict(cur_fields)
        col_f_dict = dict(col_fields)
        
        diffs = []
        for k, v in col_f_dict.items():
            if k not in cur_f_dict:
                diffs.append(f"  + Colleague has NEW field '{k}' = {v}")
            elif cur_f_dict[k] != v:
                diffs.append(f"  * Field '{k}' differs:\n      CURR: {cur_f_dict[k]}\n      COLL: {v}")
        for k, v in cur_f_dict.items():
            if k not in col_f_dict:
                diffs.append(f"  - Colleague is MISSING field '{k}' (exists in current)")
                
        if diffs:
            print(f"\nClass {cname} differences:")
            for d in diffs:
                print(d)

print("\n" + "="*80)
print("COMPARING QuestionnaireForm.jsx")
print("="*80)

with open('frontend/src/components/QuestionnaireForm.jsx', 'r', encoding='utf-8') as f:
    cur_q = f.read()

with open('scratch/colleague/QuestionnaireForm_reconstructed.jsx', 'r', encoding='utf-8') as f:
    col_q = f.read()

# Let's check sections or major blocks in QuestionnaireForm
# In QuestionnaireForm.jsx, what sections are defined in both?
cur_sections = re.findall(r'(\/\/\s*───\s*Section\s*([A-Z0-9_]+).*?)(?=\/\/\s*───\s*Section|\Z)', cur_q, re.S)
col_sections = re.findall(r'(\/\/\s*───\s*Section\s*([A-Z0-9_]+).*?)(?=\/\/\s*───\s*Section|\Z)', col_q, re.S)

cur_sec_dict = {s[1]: s[0] for s in cur_sections}
col_sec_dict = {s[1]: s[0] for s in col_sections}

print(f"Sections in Current QuestionnaireForm: {list(cur_sec_dict.keys())}")
print(f"Sections in Colleague QuestionnaireForm: {list(col_sec_dict.keys())}")

for sec_id, col_content in col_sec_dict.items():
    if sec_id not in cur_sec_dict:
        print(f"\n[NEW SECTION IN COLLEAGUE]: Section {sec_id}")
    else:
        cur_content = cur_sec_dict[sec_id]
        # Check differences
        cur_norm = re.sub(r'\s+', ' ', cur_content).strip()
        col_norm = re.sub(r'\s+', ' ', col_content).strip()
        if cur_norm != col_norm:
            print(f"\nSection {sec_id} has differences (cur len={len(cur_content)}, col len={len(col_content)})")
