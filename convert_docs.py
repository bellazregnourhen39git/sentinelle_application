import pypandoc
import os

files_to_convert = [
    ('project_pid.md', 'Project_PID.docx'),
    ('cahier_des_charges.md', 'Cahier_des_Charges.docx')
]

for md_file, docx_file in files_to_convert:
    print(f"Converting {md_file} to {docx_file}...")
    try:
        pypandoc.convert_file(md_file, 'docx', outputfile=docx_file)
        print(f"Successfully created {docx_file}")
    except Exception as e:
        print(f"Error converting {md_file}: {e}")
