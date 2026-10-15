import re

with open('frontend/src/components/QuestionnaireForm.jsx', 'r', encoding='utf-8') as f:
    text = f.read()

# Let's find all question codes and surrounding elements
# 1. FieldLabel
# 2. GridQuestion
# 3. InlineChoiceRow
# 4. EducationWithSubQuestions
# 5. CT06Question

grid_q = re.findall(r'<GridQuestion[^>]+code=["\']([^"\']+)["\'][^>]+>', text)
print("GridQuestions:", grid_q)

inline_q = re.findall(r'<InlineChoiceRow[^>]+code=["\']([^"\']+)["\'][^>]+>', text)
print("InlineChoiceRows:", inline_q)

field_labels = re.findall(r'<FieldLabel[^>]+code=["\']([^"\']+)["\'][^>]+>', text)
print("FieldLabels count:", len(field_labels))
print("FieldLabels:", field_labels)
