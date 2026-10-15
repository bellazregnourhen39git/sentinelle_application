import sys
import os
import re
import difflib

sys.stdout.reconfigure(encoding='utf-8')

print("Starting deep analysis of colleague files...")

# ==============================================================================
# 1. ANALYZE models.py
# ==============================================================================
print("\n" + "="*80)
print("1. DEEP ANALYSIS OF models.py")
print("="*80)

with open('scratch/colleague/models.py (1).txt', 'r', encoding='utf-8') as f:
    colleague_models_raw = f.readlines()

# Filter out page headers
colleague_models_lines = [l for l in colleague_models_raw if not l.startswith('// --- PAGE')]

with open('api/models.py', 'r', encoding='utf-8') as f:
    current_models_lines = f.readlines()

print(f"Current models.py line count: {len(current_models_lines)}")
print(f"Colleague models.py line count: {len(colleague_models_lines)}")

# Let's inspect sections/models defined in both
def parse_models(lines):
    models_dict = {}
    current_model = None
    current_lines = []
    
    for line in lines:
        match = re.match(r'^class\s+([A-Za-z0-9_]+)\s*(\(.*\))?:', line)
        if match:
            if current_model:
                models_dict[current_model] = current_lines
            current_model = match.group(1)
            current_lines = [line]
        elif current_model:
            # If we hit an unindented line that is not empty/comment/class, model might have ended
            if line.strip() and not line.startswith(' ') and not line.startswith('#') and not line.startswith('@'):
                models_dict[current_model] = current_lines
                current_model = None
                current_lines = []
            else:
                current_lines.append(line)
    if current_model:
        models_dict[current_model] = current_lines
    return models_dict

current_models_parsed = parse_models(current_models_lines)
colleague_models_parsed = parse_models(colleague_models_lines)

print(f"\nModels in current: {list(current_models_parsed.keys())}")
print(f"Models in colleague: {list(colleague_models_parsed.keys())}")

# Compare each model class
for model_name, col_lines in colleague_models_parsed.items():
    if model_name not in current_models_parsed:
        print(f"\n>>> [NEW MODEL IN COLLEAGUE] {model_name}:")
        print("".join(col_lines[:15]))
    else:
        cur_lines = current_models_parsed[model_name]
        # Extract fields
        def get_field_names(lines):
            fields = {}
            for l in lines:
                m = re.match(r'^\s+([a-zA-Z0-9_]+)\s*=\s*(models\.[A-Za-z0-9_]+)\((.*)', l)
                if m:
                    fields[m.group(1)] = (m.group(2), m.group(3).strip())
            return fields
        
        cur_f = get_field_names(cur_lines)
        col_f = get_field_names(col_lines)
        
        added_in_col = set(col_f.keys()) - set(cur_f.keys())
        removed_in_col = set(cur_f.keys()) - set(col_f.keys())
        diff_types = {}
        for fld in set(cur_f.keys()) & set(col_f.keys()):
            if cur_f[fld][0] != col_f[fld][0]:
                diff_types[fld] = (cur_f[fld], col_f[fld])
                
        if added_in_col or removed_in_col or diff_types:
            print(f"\n--- Model Difference: {model_name} ---")
            if added_in_col:
                print(f"  + Added in Colleague: {added_in_col}")
                for fld in added_in_col:
                    print(f"      {fld} = {col_f[fld][0]}({col_f[fld][1]}")
            if removed_in_col:
                print(f"  - Missing in Colleague (Present in Current): {removed_in_col}")
            if diff_types:
                print(f"  * Type/Definition Difference:")
                for fld, (c_def, col_def) in diff_types.items():
                    print(f"      {fld}:")
                    print(f"        Current:   {c_def[0]}({c_def[1]}")
                    print(f"        Colleague: {col_def[0]}({col_def[1]}")

# ==============================================================================
# 2. ANALYZE QuestionnaireForm.jsx
# ==============================================================================
print("\n" + "="*80)
print("2. DEEP ANALYSIS OF QuestionnaireForm.jsx")
print("="*80)

with open('scratch/colleague/QuestionnaireForm.txt', 'r', encoding='utf-8') as f:
    colleague_q_raw = f.readlines()

colleague_q_lines = [l for l in colleague_q_raw if not l.startswith('// --- PAGE')]

with open('frontend/src/components/QuestionnaireForm.jsx', 'r', encoding='utf-8') as f:
    current_q_lines = f.readlines()

print(f"Current QuestionnaireForm.jsx lines: {len(current_q_lines)}")
print(f"Colleague QuestionnaireForm.jsx lines: {len(colleague_q_lines)}")

# Let's inspect sections rendered in QuestionnaireForm.jsx
# In QuestionnaireForm.jsx, there are sections or renderSectionX / case 'A' ...
# Let's extract render functions or switch cases or subcomponents.
def find_section_cases(lines):
    cases = {}
    current_case = None
    case_lines = []
    for line in lines:
        m = re.search(r'case\s+[\'"]([A-Z0-9_]+)[\'"]\s*:', line)
        if m:
            if current_case:
                cases[current_case] = "".join(case_lines)
            current_case = m.group(1)
            case_lines = [line]
        elif current_case:
            case_lines.append(line)
    if current_case:
        cases[current_case] = "".join(case_lines)
    return cases

cur_cases = find_section_cases(current_q_lines)
col_cases = find_section_cases(colleague_q_lines)

print(f"Section cases in Current: {list(cur_cases.keys())}")
print(f"Section cases in Colleague: {list(col_cases.keys())}")

all_cases = sorted(set(cur_cases.keys()) | set(col_cases.keys()))
for c in all_cases:
    if c not in cur_cases:
        print(f"\n>>> [SECTION CASE ONLY IN COLLEAGUE] Case '{c}'")
    elif c not in col_cases:
        print(f"\n>>> [SECTION CASE ONLY IN CURRENT] Case '{c}'")
    else:
        # Check size and difference
        cur_c_str = cur_cases[c]
        col_c_str = col_cases[c]
        # Normalize whitespace
        cur_norm = re.sub(r'\s+', ' ', cur_c_str).strip()
        col_norm = re.sub(r'\s+', ' ', col_c_str).strip()
        if cur_norm != col_norm:
            print(f"\n--- Section '{c}' differs: Current len {len(cur_c_str)}, Colleague len {len(col_c_str)} ---")

print("\nAnalysis complete.")
