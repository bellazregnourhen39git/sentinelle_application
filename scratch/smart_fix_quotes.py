import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('frontend/src/components/QuestionnaireForm.jsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Fix all unescaped single quotes
replacements = [
    ("title: 'Perception du Risque et Recherche d'Aide',", 'title: "Perception du Risque et Recherche d\'Aide",'),
    ("title: 'Jeux d'Argent et de Hasard',", 'title: "Jeux d\'Argent et de Hasard",'),
    ("title: 'Validation de l'Honnêteté',", 'title: "Validation de l\'Honnêteté",'),
    ("subtitle: 'Questions sur l'inhalation de solvants, colle, essence ou gaz.',", 'subtitle: "Questions sur l\'inhalation de solvants, colle, essence ou gaz.",'),
    ("subtitle: 'Ces deux dernières questions nous aident à garantir la validité scientifique de l'étude.',", 'subtitle: "Ces deux dernières questions nous aident à garantir la validité scientifique de l\'étude.",'),
    ("subtitle: 'Comment évaluez-vous le danger lié aux différentes consommations et vers qui vous tourneriez-vous ?',", 'subtitle: "Comment évaluez-vous le danger lié aux différentes consommations et vers qui vous tourneriez-vous ?",'),
    ("title: 'Perception du Risque et Recherche d\\'Aide',", 'title: "Perception du Risque et Recherche d\'Aide",'),
    ("title: 'Jeux d\\'Argent et de Hasard',", 'title: "Jeux d\'Argent et de Hasard",'),
    ("title: 'Validation de l\\'Honnêteté',", 'title: "Validation de l\'Honnêteté",'),
]

for r_from, r_to in replacements:
    content = content.replace(r_from, r_to)

# Also check for any other pattern like `'... d'...'`
# Let's inspect line by line:
lines = content.splitlines()
fixed_lines = []
for l in lines:
    # If line has pattern `key: '... ' ...'` where single quotes are nested
    m = re.match(r'^(\s*[a-zA-Z0-9_]+:\s*)\'(.*)\'(,\s*)$', l)
    if m:
        prefix, inner, suffix = m.group(1), m.group(2), m.group(3)
        if "'" in inner and not inner.endswith("\\'"):
            # Turn into double quotes
            # replace unescaped double quotes inside inner if any
            inner_clean = inner.replace('"', '\\"')
            l = f'{prefix}"{inner_clean}"{suffix}'
    fixed_lines.append(l)

with open('frontend/src/components/QuestionnaireForm.jsx', 'w', encoding='utf-8') as f:
    f.write('\n'.join(fixed_lines) + '\n')

print("Applied smart quote fixes to QuestionnaireForm.jsx!")
