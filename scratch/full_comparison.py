import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('frontend/src/components/QuestionnaireForm.jsx', 'r', encoding='utf-8') as f:
    cur_code = f.read()

with open('scratch/colleague/QuestionnaireForm_clean.jsx', 'r', encoding='utf-8') as f:
    col_code = f.read()

# 1. INITIAL_DATA comparison
print("="*80)
print("INITIAL_DATA COMPARISON")
print("="*80)
cur_init = re.search(r'const\s+INITIAL_DATA\s*=\s*(\{[\s\S]*?\n\};)', cur_code)
col_init = re.search(r'const\s+INITIAL_DATA\s*=\s*(\{[\s\S]*?\n\};)', col_code)

if cur_init and col_init:
    print("--- Current INITIAL_DATA keys ---")
    # extract keys inside each section
    for sec_match in re.finditer(r'([a-z0-9_]+):\s*\{([^}]*)\}', cur_init.group(1)):
        sec_name = sec_match.group(1)
        fields = [f.split(':')[0].strip() for f in sec_match.group(2).split(',') if ':' in f]
        print(f"  {sec_name}: {fields}")
        
    print("\n--- Colleague INITIAL_DATA keys ---")
    for sec_match in re.finditer(r'([a-z0-9_]+):\s*\{([^}]*)\}', col_init.group(1)):
        sec_name = sec_match.group(1)
        fields = [f.split(':')[0].strip() for f in sec_match.group(2).split(',') if ':' in f]
        print(f"  {sec_name}: {fields}")

# 2. CONSTANTS comparison
print("\n" + "="*80)
print("CONSTANTS COMPARISON")
print("="*80)
cur_consts = re.findall(r'const\s+([A-Z0-9_]+)\s*=\s*', cur_code)
col_consts = re.findall(r'const\s+([A-Z0-9_]+)\s*=\s*', col_code)

print(f"Constants in Current: {cur_consts}")
print(f"Constants in Colleague: {col_consts}")
print(f"Constants only in Colleague: {set(col_consts) - set(cur_consts)}")
print(f"Constants only in Current: {set(cur_consts) - set(col_consts)}")

# 3. Main component hooks, state, functions
print("\n" + "="*80)
print("HOOKS & FUNCTIONS INSIDE QuestionnaireForm")
print("="*80)
for name in ['handleSubmit', 'handleFinalize', 'validateSection', 'handleChange', 'update', 'fetchConfig']:
    print(f"\nFunction: {name}")
    cur_fn = re.search(r'(?:const|function)\s+' + name + r'[\s\S]*?(?=\n\s*(?:const|function|return|\/\/\s*───))', cur_code)
    col_fn = re.search(r'(?:const|function)\s+' + name + r'[\s\S]*?(?=\n\s*(?:const|function|return|\/\/\s*───))', col_code)
    print(f"  In Current: {'YES (' + str(len(cur_fn.group(0))) + ' chars)' if cur_fn else 'NO'}")
    print(f"  In Colleague: {'YES (' + str(len(col_fn.group(0))) + ' chars)' if col_fn else 'NO'}")
