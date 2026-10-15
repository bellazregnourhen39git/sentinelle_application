import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('scratch/old_QuestionnaireForm.jsx', 'r', encoding='utf-8') as f:
    old = f.read()

# Let's search for all buttons in the return statement of old QuestionnaireForm
m_return = old.rfind('return (')
if m_return != -1:
    return_block = old[m_return:]
    print("=== RETURN BLOCK OF OLD QuestionnaireForm.jsx ===")
    print(return_block[:3500])

# Let's search functions defined in old QuestionnaireForm
fns = re.findall(r'(?:const|function)\s+([a-zA-Z0-9_]+)\s*=\s*(?:\([^)]*\)|function)?\s*=>?', old)
print("\nAll functions/consts inside old file:", fns)
