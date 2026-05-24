import pypandoc
import os

files = [
    ('cdc_master.md', 'Cahier_des_Charges_Sentinelle_V2.docx'),
    ('pid_master.md', 'Project_PID_Sentinelle_V2.docx')
]

for md_file, docx_file in files:
    print(f"Converting {md_file} to {docx_file}...")
    try:
        # Convert with pandoc
        pypandoc.convert_file(md_file, 'docx', outputfile=docx_file)
        print(f"Successfully generated {docx_file}")
    except Exception as e:
        print(f"Error converting {md_file}: {e}")
