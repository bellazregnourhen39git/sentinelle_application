import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('frontend/src/components/QuestionnaireForm.jsx', 'r', encoding='utf-8') as f:
    code = f.read()

# Replace any single-quoted string containing unescaped apostrophes
# Better yet, let's fix the specific items in assemble_questionnaire.py and re-generate
with open('scratch/assemble_questionnaire.py', 'r', encoding='utf-8') as f:
    asm = f.read()

# Fix unescaped single quotes in assembly_code
asm_fixed = asm.replace("'(C.A04b) Parce que vous n\\'aviez pas envie d\\'aller au lycée'", '"(C.A04b) Parce que vous n\'aviez pas envie d\'aller au lycée"')
asm_fixed = asm_fixed.replace("'(C.A06d) Pratiquer d\\'autres loisirs (musique, théâtre...)'", '"(C.A06d) Pratiquer d\'autres loisirs (musique, théâtre...)"')
asm_fixed = asm_fixed.replace("'(C.A06f) Utiliser Internet pour les loisirs'", '"(C.A06f) Utiliser Internet pour les loisirs"')
asm_fixed = asm_fixed.replace("'(C.A06g) Regarder la télévision ou des vidéos'", '"(C.A06g) Regarder la télévision ou des vidéos"')
asm_fixed = asm_fixed.replace("'(C.R01a) Les jours d\\'école (du lundi au vendredi)'", '"(C.R01a) Les jours d\'école (du lundi au vendredi)"')
asm_fixed = asm_fixed.replace("'(C.R01b) Les jours de congé ou week-ends'", '"(C.R01b) Les jours de congé ou week-ends"')
asm_fixed = asm_fixed.replace("'(C.R02a) Je ne peux pas m\\'empêcher de penser aux réseaux sociaux'", '"(C.R02a) Je ne peux pas m\'empêcher de penser aux réseaux sociaux"')
asm_fixed = asm_fixed.replace("'(C.R02b) J\\'ai négligé d\\'autres activités à cause des réseaux sociaux'", '"(C.R02b) J\'ai négligé d\'autres activités à cause des réseaux sociaux"')
asm_fixed = asm_fixed.replace("'(C.T06b) Combien de fois avez-vous dépensé plus d\\'argent que prévu dans les paris ?'", '"(C.T06b) Combien de fois avez-vous dépensé plus d\'argent que prévu dans les paris ?"')
asm_fixed = asm_fixed.replace("'(C.T06c) Combien de fois vous êtes-vous senti coupable d\\'avoir parié ?'", '"(C.T06c) Combien de fois vous êtes-vous senti coupable d\'avoir parié ?"')
asm_fixed = asm_fixed.replace("'(C.T06d) Le jeu d\\'argent a-t-il déjà causé des disputes avec vos proches ?'", '"(C.T06d) Le jeu d\'argent a-t-il déjà causé des disputes avec vos proches ?"')
asm_fixed = asm_fixed.replace("'(C.T06e) Avez-vous déjà emprunté de l\\'argent pour parier ?'", '"(C.T06e) Avez-vous déjà emprunté de l\'argent pour parier ?"')

with open('scratch/assemble_questionnaire.py', 'w', encoding='utf-8') as f:
    f.write(asm_fixed)

print("Updated assemble_questionnaire.py!")
