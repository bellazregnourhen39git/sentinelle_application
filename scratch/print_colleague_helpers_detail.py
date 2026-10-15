import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('frontend/src/components/QuestionnaireForm.jsx', 'r', encoding='utf-8') as f:
    cur_jsx = f.read()

with open('scratch/colleague/QuestionnaireForm.txt', 'r', encoding='utf-8') as f:
    col_raw = f.read()

col_jsx = re.sub(r'// --- PAGE \d+ ---\n', '', col_raw)

# Let's extract helper components from colleague
helpers = [
    'ChoiceInteractionStyles', 'ChoiceNumber', 'SquareMark', 'SquareCheckbox', 
    'ChoiceButton', 'VerticalChoiceList', 'InlineChoiceRow', 'DigitBoxes', 
    'EducationWithSubQuestions', 'CT06Question'
]

for h in helpers:
    print(f"\n==================== HELPER: {h} ====================")
    # find definition
    m = re.search(r'((?:const|function)\s+' + h + r'[\s\S]*?)(?=\n(?:const|function|\/\/\s*───))', col_jsx)
    if m:
        print(m.group(1).strip()[:1500])
    else:
        print("NOT FOUND")
