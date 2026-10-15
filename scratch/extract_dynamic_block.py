import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('scratch/colleague/QuestionnaireForm_clean.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Let's extract the dynamic questions processing block and modal
start_marker = "const processedSections = "
end_marker = "const SECTIONS = processedSections;"

idx1 = text.find(start_marker)
idx2 = text.find(end_marker)

print("Dynamic questions block in colleague:")
if idx1 != -1 and idx2 != -1:
    print(text[idx1:idx2+len(end_marker)])
else:
    # search around processedSections
    m = re.search(r'processedSections[\s\S]*?(?=return|\n\s*const currentSection)', text)
    if m:
        print(m.group(0))
