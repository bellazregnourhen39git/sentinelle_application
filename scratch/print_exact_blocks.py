import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scratch/old_QuestionnaireForm.jsx', 'r', encoding='utf-8') as f:
    old = f.read()

# 1. FieldLabel and EditModeContext
idx1 = old.find('const EditModeContext =')
if idx1 == -1:
    idx1 = old.find('EditModeContext')
idx2 = old.find('const SelectField =')
print("=== EditModeContext and FieldLabel ===")
print(old[idx1:idx2])

# 2. generateRandomData full
idx_rand = old.find('const generateRandomData = () => {')
idx_rand_end = old.find('const isHidden =')
if idx_rand_end == -1:
    idx_rand_end = old.find('const QuestionnaireForm =')
print("\n=== generateRandomData ===")
print(old[idx_rand:idx_rand_end])

# 3. Header / Progress dots / Navigation in return statement
idx_ret = old.find('return (')
print("\n=== Full Return statement of old file ===")
print(old[idx_ret:idx_ret+4000])
