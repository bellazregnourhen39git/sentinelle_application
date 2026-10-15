import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('frontend/src/components/QuestionnaireForm.jsx', 'r', encoding='utf-8') as f:
    cur_jsx = f.read()

with open('scratch/colleague/QuestionnaireForm_clean.jsx', 'r', encoding='utf-8') as f:
    col_jsx = f.read()

print("--- Checking Current QuestionnaireForm features ---")
print("Has LocationSelectionModal:", 'LocationSelectionModal' in cur_jsx)
print("Has Dynamic Questions Editor:", 'editingItem' in cur_jsx and 'setEditingItem' in cur_jsx)
print("Has Finalize Modal:", 'showFinalizeModal' in cur_jsx)
print("Has openReports / loadingReports:", 'loadingReports' in cur_jsx)
print("Has isEditMode:", 'isEditMode' in cur_jsx)
print("Has survey_date:", 'survey_date' in cur_jsx)

print("\n--- Checking Colleague QuestionnaireForm features ---")
print("Has LocationSelectionModal:", 'LocationSelectionModal' in col_jsx)
print("Has Dynamic Questions Editor:", 'editingItem' in col_jsx and 'setEditingItem' in col_jsx)
print("Has Finalize Modal:", 'showFinalizeModal' in col_jsx)
print("Has isEditMode:", 'isEditMode' in col_jsx)
print("Has SquareMark / SquareCheckbox:", 'SquareMark' in col_jsx)
print("Has VerticalChoiceList:", 'VerticalChoiceList' in col_jsx)
print("Has InlineChoiceRow:", 'InlineChoiceRow' in col_jsx)
print("Has DigitBoxes:", 'DigitBoxes' in col_jsx)
print("Has EducationWithSubQuestions:", 'EducationWithSubQuestions' in col_jsx)
print("Has CT06Question:", 'CT06Question' in col_jsx)
print("Has JOBS_FATHER / JOBS_MOTHER:", 'JOBS_FATHER' in col_jsx)
print("Has AGREEMENT_SCALE_PAPER:", 'AGREEMENT_SCALE_PAPER' in col_jsx)
