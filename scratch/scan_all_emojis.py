import os, re

emoji_pattern = re.compile(r'[\U00010000-\U0010ffff\u2600-\u27ff\u2300-\u23ff\u2b50\u2b55\u200d\u20e3\uFE0F\u2700-\u27BF]')

for root, dirs, files in os.walk('frontend/src'):
    for file in files:
        if file.endswith(('.jsx', '.js', '.tsx', '.ts', '.css', '.html')):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                content = f.read()
            matches = emoji_pattern.findall(content)
            if matches:
                reprs = [f"\\u{ord(c):04x}" if ord(c) < 65536 else f"\\U{ord(c):08x}" for c in set(matches)]
                print(f"{filepath}: {len(matches)} emojis -> {reprs}")
