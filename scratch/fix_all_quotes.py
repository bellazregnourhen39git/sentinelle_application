import sys
import re

sys.stdout.reconfigure(encoding='utf-8')

with open('scratch/assemble_questionnaire.py', 'r', encoding='utf-8') as f:
    code = f.read()

# Replace any single-quoted strings that contain an unescaped single quote
# E.g. title: 'Perception du Risque et Recherche d'Aide' -> "Perception du Risque et Recherche d'Aide"
code = code.replace("title: 'Perception du Risque et Recherche d'Aide'", 'title: "Perception du Risque et Recherche d\'Aide"')
code = code.replace("title: 'Jeux d'Argent et de Hasard'", 'title: "Jeux d\'Argent et de Hasard"')
code = code.replace("subtitle: 'Questions sur l’inhalation de solvants, colle, essence ou gaz.'", 'subtitle: "Questions sur l\'inhalation de solvants, colle, essence ou gaz."')
code = code.replace("title: 'Validation de l'Honnêteté'", 'title: "Validation de l\'Honnêteté"')
code = code.replace("subtitle: 'Ces deux dernières questions nous aident à garantir la validité scientifique de l'étude.'", 'subtitle: "Ces deux dernières questions nous aident à garantir la validité scientifique de l\'étude."')
code = code.replace("title: 'Questions d'évaluation sur les habitudes de jeu :'", 'title: "Questions d\'évaluation sur les habitudes de jeu :"')
code = code.replace("fr=\"Combien de fois avez-vous joué à des jeux d’argent durant les 12 DERNIERS MOIS ?\"", 'fr="Combien de fois avez-vous joué à des jeux d\'argent durant les 12 DERNIERS MOIS ?"')
code = code.replace("fr=\"Au cours des 12 DERNIERS MOIS, à quelle fréquence avez-vous joué à ces jeux d’argent EN RÉEL (kiosques, locaux...) :\"", 'fr="Au cours des 12 DERNIERS MOIS, à quelle fréquence avez-vous joué à ces jeux d\'argent EN RÉEL (kiosques, locaux...) :"')
code = code.replace("fr=\"Au cours des 12 DERNIERS MOIS, à quelle fréquence avez-vous joué à ces jeux d’argent EN LIGNE (Internet, téléphone) :\"", 'fr="Au cours des 12 DERNIERS MOIS, à quelle fréquence avez-vous joué à ces jeux d\'argent EN LIGNE (Internet, téléphone) :"')
code = code.replace("fr=\"Avez-vous déjà ressenti le besoin de parier des sommes d'argent de plus en plus importantes ?\"", 'fr="Avez-vous déjà ressenti le besoin de parier des sommes d\'argent de plus en plus importantes ?"')
code = code.replace("fr=\"Quel est votre degré d'appréciation de l'école ?\"", 'fr="Quel est votre degré d\'appréciation de l\'école ?"')
code = code.replace("fr=\"Si l'un ou les deux parents ne vivent pas avec vous, quelle en est la raison principale ?\"", 'fr="Si l\'un ou les deux parents ne vivent pas avec vous, quelle en est la raison principale ?"')
code = code.replace("title=\"D’une manière générale, quel est votre degré de satisfaction de votre relation avec :\"", 'title="D\'une manière générale, quel est votre degré de satisfaction de votre relation avec :"')
code = code.replace("title=\"Dans quelle mesure êtes-vous d'accord avec les affirmations suivantes :\"", 'title="Dans quelle mesure êtes-vous d\'accord avec les affirmations suivantes :"')
code = code.replace("title=\"Dans quelle mesure êtes-vous d’accord ou en désaccord avec les avis suivants concernant les jeux vidéo :\"", 'title="Dans quelle mesure êtes-vous d\'accord ou en désaccord avec les avis suivants concernant les jeux vidéo :"')
code = code.replace("fr=\"Dans quelle mesure avez-vous répondu honnêtement aux questions concernant votre consommation d'alcool ?\"", 'fr="Dans quelle mesure avez-vous répondu honnêtement aux questions concernant votre consommation d\'alcool ?"')

with open('scratch/assemble_questionnaire.py', 'w', encoding='utf-8') as f:
    f.write(code)

print("Updated assemble_questionnaire.py with double quotes for all title/subtitle/fr strings!")
