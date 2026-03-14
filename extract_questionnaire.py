import docx
import os

doc_path = "MedSPAD_Questionnaire Français 2026 (1).docx"
output_path = "questionnaire_structure.txt"

if os.path.exists(doc_path):
    doc = docx.Document(doc_path)
    with open(output_path, "w", encoding="utf-8") as f:
        for para in doc.paragraphs:
            if para.text.strip():
                f.write(para.text + "\n")
    print(f"Extracted content to {output_path}")
else:
    print(f"File {doc_path} not found")
