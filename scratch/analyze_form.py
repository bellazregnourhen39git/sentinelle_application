import re

with open('frontend/src/components/QuestionnaireForm.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# find all FieldLabel
labels = re.findall(r'<FieldLabel[^>]+>', text)
print(f"Total FieldLabels: {len(labels)}")
for l in labels[:15]:
    print(l)

# find emojis in text
emojis = re.findall(r'[\U00010000-\U0010ffff\u2600-\u27ff\u2300-\u23ff\u2b50\u2b55\u200d\u20e3\uFE0F]', text)
print(f"Total emojis found: {len(emojis)}")
print(set(emojis))
