import re

with open('frontend/src/components/QuestionnaireForm.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Emoji regex
emoji_pattern = re.compile(r'[\U00010000-\U0010ffff\u2600-\u27ff\u2300-\u23ff\u2b50\u2b55\u200d\u20e3\uFE0F]')
emojis = emoji_pattern.findall(text)
print(f"Total emojis found: {len(emojis)}")

# Find lines with emojis
lines = text.split('\n')
for i, line in enumerate(lines):
    if emoji_pattern.search(line):
        # replace non-ascii for safe printing
        safe_line = emoji_pattern.sub('[EMOJI]', line).encode('ascii', errors='replace').decode('ascii')
        print(f"Line {i+1}: {safe_line}")
