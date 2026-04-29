import docx
import json

def extract_docx(path):
    doc = docx.Document(path)
    full_text = []
    for para in doc.paragraphs:
        full_text.append(para.text)
    return "\n".join(full_text)

try:
    text = extract_docx("MedSPAD_Rapport de classe (Français) corrigé le 29_03_2021_rev.docx")
    print(text)
except Exception as e:
    print(f"Error: {e}")
