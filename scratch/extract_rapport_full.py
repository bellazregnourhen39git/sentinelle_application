import docx
import os

doc_path = "MedSPAD_Rapport de classe (Français) corrigé le 29_03_2021_rev.docx"
output_path = "rapport_structure.txt"

def extract():
    if not os.path.exists(doc_path):
        print(f"File {doc_path} not found")
        return

    doc = docx.Document(doc_path)
    with open(output_path, "w", encoding="utf-8") as f:
        for element in doc.element.body:
            if element.tag.endswith('p'):
                para = docx.text.paragraph.Paragraph(element, doc)
                if para.text.strip():
                    f.write(para.text + "\n")
            elif element.tag.endswith('tbl'):
                table = docx.table.Table(element, doc)
                f.write("\n--- TABLE START ---\n")
                for row in table.rows:
                    cells = [cell.text.strip().replace("\n", " ") for cell in row.cells]
                    f.write(" | ".join(cells) + "\n")
                f.write("--- TABLE END ---\n\n")

if __name__ == "__main__":
    extract()
    print(f"Done. Check {output_path}")
