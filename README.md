# Sentinelle : Plateforme d'Intelligence Épidémiologique et de Prévention des Addictions (MedSPAD 2026)

## 📋 Présentation du Projet
**Sentinelle** est une plateforme numérique avancée conçue spécifiquement pour le programme **MedSPAD 2026** (Mediterranean School Survey Project on Alcohol and Other Drugs). Le système modernise radicalement la collecte, la numérisation et l'analyse des données de santé publique à grande échelle. 

Au cœur de sa mission, Sentinelle se positionne comme un outil de première ligne dans **la détection, la lutte et la prévention contre les addictions** chez les adolescents. En couplant la surveillance épidémiologique traditionnelle à la modélisation prédictive par intelligence artificielle, la plateforme permet d'identifier précocement les signaux d'alerte liés à l'usage de substances psychoactives (tabac, alcool, cannabis, drogues de synthèse) et aux addictions comportementales (cyberaddiction, jeux d'argent, etc.).

---

## ✨ Fonctionnalités Principales

### 1. Surveillance et Cartographie des Addictions
- Tableaux de bord dynamiques et interactifs permettant de visualiser en temps réel la prévalence de l'usage des différentes substances.
- Analyse granulaire des comportements à risque (polyconsommation, âge de la première expérimentation) à l'échelle nationale, régionale et par établissement.
- Suivi rigoureux des nouvelles substances psychoactives (NSP) et des modes de consommation émergents (e-cigarettes, chicha, médicaments détournés).

### 2. Pipeline de Numérisation Automatisé (OCR)
- Remplacement de la saisie manuelle chronophage par un système de reconnaissance optique de caractères (OCR) optimisé via Tesseract.
- Extraction et validation stricte des questionnaires papier MedSPAD avec un schéma JSON qui garantit l'intégrité clinique absolue des données d'addictologie recueillies.
- Interface de validation avec boucle d'interaction humaine, garantissant une conformité parfaite avec les rapports officiels.

### 3. Moteur IA de Prédiction des Risques et du Stress
- Intégration d'un **pipeline d'apprentissage automatique (Voting Regressor)** qui évalue le niveau de stress des élèves en fonction de leurs indicateurs socio-économiques, relationnels et scolaires.
- Mise en évidence des corrélations cliniques entre la détresse psychologique masquée (stress de performance, harcèlement, estime de soi) et la bascule vers les conduites addictives (logique d'automédication).

### 4. Interopérabilité et Rapports de Santé Publique
- Intégration transparente et flux d'exportation vers le système **SIDRA** (Système d'Information sur les Drogues et les Risques à l'Adolescence).
- Génération de rapports analytiques formatés pour équiper directement les décideurs et les équipes pédagogiques face aux problématiques d'addiction ciblées de leur secteur.

### 5. Contrôle d'Accès et Confidentialité (RBAC)
- Architecture de sécurité stricte adaptée à la sensibilité des données médicales et addictologiques des mineurs.
- Niveaux d'accès granulaires (Super Administrateur, Analyste Régional, Opérateur de Saisie, Praticien) garantissant que seules les entités autorisées accèdent aux insights de santé publique.

---

## 🛠️ Stack Technologique

**Backend & Traitement des Données :**
- **Framework :** Django & Django REST Framework (Python)
- **Base de données :** SQLite (modélisation experte des schémas de vulnérabilité et d'addiction du MedSPAD)
- **IA & OCR :** Scikit-Learn (Pipelines d'Ensemble), Tesseract OCR, Pandas

**Frontend & Visualisation :**
- **Framework :** React 19 (Vite)
- **Design UI/UX :** Tailwind CSS, Framer Motion
- **Data Visualisation :** Recharts, D3.js, MapLibre GL (pour la cartographie territoriale des facteurs de risque)

---

## 🎯 Impact & Vision
Sentinelle agit comme un véritable bouclier épidémiologique. En comblant le fossé entre la collecte papier classique et l'analyse prédictive en temps réel, la plateforme donne aux responsables de la santé publique et aux praticiens en addictologie une longueur d'avance. L'objectif n'est plus seulement de mesurer la consommation, mais d'**anticiper les dépendances et de déclencher des interventions préventives ciblées** pour protéger le développement et la santé mentale de la jeunesse.
