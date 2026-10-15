import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scratch/old_QuestionnaireForm.jsx', 'r', encoding='utf-8') as f:
    old = f.read()

# Search for isSuperAdmin or how edit button is rendered
idx = old.find('isSuperAdmin')
while idx != -1:
    print("--- isSuperAdmin match ---")
    print(old[max(0, idx-100):min(len(old), idx+300)])
    idx = old.find('isSuperAdmin', idx+1)

# Also check how currentUser is fetched or checked in old file
for m in ['localStorage.getItem(\'user\')', 'localStorage.getItem("user")', 'currentUser', 'setIsEditMode']:
    idx = old.find(m)
    if idx != -1:
        print(f"--- {m} match ---")
        print(old[max(0, idx-100):min(len(old), idx+300)])
