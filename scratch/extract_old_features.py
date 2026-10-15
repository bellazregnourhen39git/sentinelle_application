import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('scratch/old_QuestionnaireForm.jsx', 'r', encoding='utf-8') as f:
    old = f.read()

# 1. Search for random fill
print("="*80)
print("1. RANDOM FILL FEATURE")
print("="*80)
for m in re.finditer(r'(?:fillRandom|random|mock|autoFill)[\s\S]{1,600}', old, re.I):
    print(m.group(0)[:500])
    print("-" * 40)

# 2. Search for draft
print("="*80)
print("2. DRAFT / SAVE PROGRESS FEATURE")
print("="*80)
for m in re.finditer(r'(?:draft|saveDraft|saveProgress|localStorage|brouillon)[\s\S]{1,600}', old, re.I):
    print(m.group(0)[:500])
    print("-" * 40)

# 3. Search for progress navigation / dots / section pill selector
print("="*80)
print("3. SECTION NAVIGATION / DOTS / PROGRESS PILLS")
print("="*80)
for m in re.finditer(r'(?:step ===|setStep\(|steps|dots|SECTIONS\.map)[\s\S]{1,600}', old):
    print(m.group(0)[:500])
    print("-" * 40)

# 4. Search for edit mode / dynamic questions in old file
print("="*80)
print("4. EDIT MODE & DYNAMIC QUESTIONS")
print("="*80)
for m in re.finditer(r'(?:isEditMode|editingItem|dynamicConfigs|canEdit|isAdmin)[\s\S]{1,600}', old):
    print(m.group(0)[:500])
    print("-" * 40)
