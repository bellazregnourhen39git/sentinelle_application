import sys
import os
import re

sys.stdout.reconfigure(encoding='utf-8')

# --- Part 1: Clean Colleague models.py ---
with open('scratch/colleague/models.py (1).txt', 'r', encoding='utf-8') as f:
    col_raw = f.readlines()

# Join wrapped lines properly
col_lines = []
for line in col_raw:
    if line.startswith('// --- PAGE'):
        continue
    # Strip trailing whitespace and newlines
    line_clean = line.rstrip('\r\n')
    if not line_clean:
        col_lines.append('')
        continue
    
    # If line starts with box drawing
    if re.match(r'^[─═\-_#\s]+$', line_clean.strip()) and col_lines and col_lines[-1].strip().startswith('#'):
        col_lines[-1] = col_lines[-1] + ' ' + line_clean.strip()
        continue
        
    # Check if previous line ended incomplete
    if col_lines:
        prev = col_lines[-1]
        # if prev is a comment line that got broken
        if prev.strip().startswith('#') and not line_clean.strip().startswith('#') and ('──' in prev or '──' in line_clean):
            col_lines[-1] = prev + ' ' + line_clean.strip()
            continue
        # if prev ended with open paren or comma or equals
        if prev.rstrip().endswith(('(', ',', '=', 'choices=', 'default=')) or \
           (line_clean.strip().startswith(('on_delete=', 'related_name=', 'max_length=', 'blank=', 'null=', 'default=', 'choices=', 'unique=', 'help_text=')) and not prev.strip().endswith(':')):
            col_lines[-1] = prev + ' ' + line_clean.strip()
            continue
        # If open parens
        if prev.count('(') > prev.count(')'):
            col_lines[-1] = prev + ' ' + line_clean.strip()
            continue
    col_lines.append(line_clean)

with open('scratch/colleague/models_reconstructed.py', 'w', encoding='utf-8') as f:
    f.write('\n'.join(col_lines) + '\n')

print("Colleague models.py reconstructed lines:", len(col_lines))

# --- Part 2: Clean Colleague QuestionnaireForm.jsx ---
with open('scratch/colleague/QuestionnaireForm.txt', 'r', encoding='utf-8') as f:
    q_raw = f.readlines()

q_lines = []
for line in q_raw:
    if line.startswith('// --- PAGE'):
        continue
    line_clean = line.rstrip('\r\n')
    if not line_clean:
        q_lines.append('')
        continue
    if q_lines:
        prev = q_lines[-1]
        if prev.strip().startswith('//') and not line_clean.strip().startswith('//') and ('──' in prev or '──' in line_clean):
            q_lines[-1] = prev + ' ' + line_clean.strip()
            continue
        # If prev ended with open paren or comma or operator or jsx attribute
        if prev.rstrip().endswith(('(', '[', '{', ',', '&&', '||', '+', '=>', ':', '?')) or \
           (line_clean.strip().startswith(('onClick=', 'onChange=', 'className=', 'value=', 'name=', 'key=', 'type=', 'placeholder=', 'disabled=')) and not prev.strip().endswith('>')):
            q_lines[-1] = prev + ' ' + line_clean.strip()
            continue
        if prev.count('(') > prev.count(')') or prev.count('[') > prev.count(']') or (prev.count('{') > prev.count('}') and not prev.strip().endswith(';')):
            # check if it was broken
            if not line_clean.startswith(' ') and not line_clean.startswith('\t') and not line_clean.startswith('const ') and not line_clean.startswith('function ') and not line_clean.startswith('import ') and not line_clean.startswith('export '):
                q_lines[-1] = prev + ' ' + line_clean.strip()
                continue
    q_lines.append(line_clean)

with open('scratch/colleague/QuestionnaireForm_reconstructed.jsx', 'w', encoding='utf-8') as f:
    f.write('\n'.join(q_lines) + '\n')

print("Colleague QuestionnaireForm.jsx reconstructed lines:", len(q_lines))
