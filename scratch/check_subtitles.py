with open('frontend/src/components/QuestionnaireForm.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

for i, line in enumerate(lines):
    if "id: 'section_" in line or "letter: '" in line or "subtitle:" in line or "subtitleAr:" in line or "title:" in line:
        if i > 1460 and i < 2600:
            print(f"{i+1}: {line.strip()}")
