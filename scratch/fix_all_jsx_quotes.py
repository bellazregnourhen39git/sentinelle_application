import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('frontend/src/components/QuestionnaireForm.jsx', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
for idx, line in enumerate(lines):
    # If line contains array items like ['...', '(...) ... d' ...', '...']
    # Let's replace any single-quoted string containing internal apostrophes with double quotes
    # Match pattern: '([^'\n]*'[^'\n]*)'
    # Specifically, inside [...] find elements separated by commas
    def fix_array_line(l):
        # If line contains `['...']`
        # Let's replace french text with apostrophes like d'..., l'..., n'..., j'..., qu'..., s'..., m'..., t'..., c'..., l’...
        # E.g. '... d'alcool ...' -> "... d'alcool ..."
        # Let's use a regex to convert all array elements to double quotes
        # Pattern: \['([^']*)',\s*'([^']*(?:'[^']*)+)',\s*'([^']*)'\]
        # Or more generally: if a single quote has a letter before and after it, e.g. [a-zA-Z]'[a-zA-Z], it's an apostrophe
        # We can temporarily replace it, or turn the string into double quotes.
        return l
        
    # Let's do regex replacement of apostrophes within single quotes
    # Look for: ('[a-zA-Z0-9_]+',\s*)'([^']*(?:'[a-zA-ZÀ-ÿ])[^']*)'
    line = re.sub(r"(?<=\[)'([a-zA-Z0-9_]+)',\s*'([^'\n]+(?:\'[a-zA-ZÀ-ÿ])[^'\n]*)',\s*'([^'\n]*)'\]", r'[\1, "\2", "\3"]', line)
    
    # Also for items with numbers or two elements
    # Let's replace any single-quoted string where an internal single quote is surrounded by word chars
    # Find all '...' substrings on the line
    # If a substring has an odd number of single quotes
    if line.count("'") % 2 != 0:
        # It means there is an unescaped single quote
        # Let's find all words with apostrophes like d', l', n', j', qu', s', m', t', c', etc. and escape or convert
        # E.g. d' -> d\'
        line = re.sub(r"\b([a-zA-Z])'([a-zA-Z])", r"\1\'\2", line)
        line = re.sub(r"\b([qQ]u)'([a-zA-Z])", r"\1\'\2", line)
        line = re.sub(r"\b([jJ])'([a-zA-Z])", r"\1\'\2", line)
        line = re.sub(r"\b([dD])'([a-zA-Z])", r"\1\'\2", line)
        line = re.sub(r"\b([lL])'([a-zA-Z])", r"\1\'\2", line)
        line = re.sub(r"\b([nN])'([a-zA-Z])", r"\1\'\2", line)
        line = re.sub(r"\b([sS])'([a-zA-Z])", r"\1\'\2", line)
        line = re.sub(r"\b([mM])'([a-zA-Z])", r"\1\'\2", line)
        line = re.sub(r"\b([tT])'([a-zA-Z])", r"\1\'\2", line)
        line = re.sub(r"\b([cC])'([a-zA-Z])", r"\1\'\2", line)
        
    new_lines.append(line)

with open('frontend/src/components/QuestionnaireForm.jsx', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)

print("Applied fix_all_jsx_quotes.py successfully!")
