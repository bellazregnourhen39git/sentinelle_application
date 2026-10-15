import sys

sys.stdout.reconfigure(encoding='utf-8')

with open('scratch/old_QuestionnaireForm.jsx', 'r', encoding='utf-8') as f:
    old = f.read()

# Find main return of QuestionnaireForm component
idx = old.find('return (\n    <div className={`min-h-screen')
if idx == -1:
    idx = old.find('return (\r\n    <div className={`min-h-screen')
if idx == -1:
    # search for <div className="min-h-screen
    idx = old.find('<div className={`min-h-screen')

print("Main JSX of QuestionnaireForm:")
print(old[idx:idx+4500])
