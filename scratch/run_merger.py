import sys
import os

sys.stdout.reconfigure(encoding='utf-8')

# Read header & constants
with open('scratch/merged_header_constants.js', 'r', encoding='utf-8') as f:
    header = f.read()

# Let's inspect the assemble_questionnaire.py and execute it
exec(open('scratch/assemble_questionnaire.py', encoding='utf-8').read())

print("Finished assembling form!")
