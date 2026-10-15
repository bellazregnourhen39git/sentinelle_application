import sys
import os
import re

sys.stdout.reconfigure(encoding='utf-8')

print("Starting deep diff of QuestionnaireForm...")

with open('frontend/src/components/QuestionnaireForm.jsx', 'r', encoding='utf-8') as f:
    cur_jsx = f.read()

with open('scratch/colleague/QuestionnaireForm.txt', 'r', encoding='utf-8') as f:
    col_raw = f.read()

# Filter page markers
col_jsx = re.sub(r'// --- PAGE \d+ ---\n', '', col_raw)

# 1. Compare imports
cur_imports = re.findall(r'^import\s+.*?;', cur_jsx, re.M)
col_imports = re.findall(r'^import\s+.*?;', col_jsx, re.M)
print("=== Imports in Current ===")
for imp in cur_imports:
    print(" ", imp)
print("\n=== Imports in Colleague ===")
for imp in col_imports:
    print(" ", imp)

# 2. Check all helper components / functions defined outside the main component
def get_top_level_fns(code):
    fns = re.findall(r'^(?:const|function)\s+([A-Za-z0-9_]+)\s*=?\s*(?:\([^)]*\)|function)?\s*=>?', code, re.M)
    return set(fns)

print("\nTop-level identifiers in Current:", get_top_level_fns(cur_jsx))
print("Top-level identifiers in Colleague:", get_top_level_fns(col_jsx))

# 3. Check State variables in QuestionnaireForm component
# In QuestionnaireForm = () => { ... }
def get_state_vars(code):
    states = re.findall(r'const\s+\[([a-zA-Z0-9_]+),\s*set[a-zA-Z0-9_]+\]\s*=\s*useState', code)
    return set(states)

print("\nState vars in Current:", get_state_vars(cur_jsx))
print("State vars in Colleague:", get_state_vars(col_jsx))

# 4. Check sections list (SECTIONS array)
cur_sections_match = re.search(r'const\s+SECTIONS\s*=\s*(\[.*?\]);', cur_jsx, re.S)
col_sections_match = re.search(r'const\s+SECTIONS\s*=\s*(\[.*?\]);', col_jsx, re.S)

if cur_sections_match:
    print("\nCurrent SECTIONS:\n", cur_sections_match.group(1)[:500])
if col_sections_match:
    print("\nColleague SECTIONS:\n", col_sections_match.group(1)[:500])
