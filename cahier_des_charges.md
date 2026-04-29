# Cahier des Charges Technico-Fonctionnel
## Projet Sentinelle – Plateforme MedSPAD 2026

---

## 1. Présentation Générale
### 1.1 Contexte
Le projet **Sentinelle** s'inscrit dans le cadre de l'enquête épidémiologique **MedSPAD 2026** (Mediterranean School Survey Project on Alcohol and Other Drugs). Face à la complexité croissante des conduites addictives chez les jeunes (polyconsommation, nouvelles substances psychoactives, cyberaddiction) et à la nécessité d'une réactivité accrue des pouvoirs publics, le projet vise à numériser l'intégralité du cycle de vie des données, de la collecte à la prise de décision.

### 1.2 Objectif du Document
Ce cahier des charges définit les spécifications fonctionnelles, techniques, et architecturales pour la conception et le développement de la plateforme Sentinelle.

---

## 2. Spécifications Fonctionnelles
Le système est articulé autour de quatre modules métier principaux.

### 2.1 Module 1 : Pipeline de Numérisation et de Collecte (OCR)
- **Acquisition :** Remplacement de la saisie manuelle par un système de Reconnaissance Optique de Caractères (OCR) piloté par Tesseract.
- **Validation Structurée :** Les données extraites doivent être soumises à une validation stricte via un schéma JSON garantissant l'intégrité clinique (21 sections, de A à Z).
- **Interface de Révision :** Implémentation d'une boucle humaine (Human-in-the-loop) permettant aux opérateurs de saisir, de vérifier et de corriger les anomalies détectées par l'algorithme avant soumission.

### 2.2 Module 2 : Moteur de Prédiction et Intelligence Artificielle
- **Scoring Clinique :** Développement d'un pipeline d'apprentissage automatique (Voting Regressor) capable de prédire le niveau de stress et de vulnérabilité des élèves à partir des indicateurs socio-économiques, familiaux et scolaires.
- **Moteur de Corrélation Avancé :** Déclenchement à la demande d'analyses statistiques complexes (via Celery) incluant :
  - *Co-occurrence (Apriori) :* Identification des associations de comportements (ex: Cannabis + Violence).
  - *Matrice de Sévérité :* Évaluation statistique (Chi-carré) des types d'addiction.
  - *Modèles Démographiques :* Sur-représentation de certains profils (Âge/Sexe).
  - *Clustering Géographique (DBSCAN) :* Détection de "hotspots" spatiaux.

### 2.3 Module 3 : Visualisation (Dashboarding) et Cartographie
- **Navigation Radiale :** L'interface principale doit utiliser une roue radiale segmentée pour naviguer entre les 21 sections du questionnaire MedSPAD.
- **Analyse Contextuelle (Homepage) :** Affichage d'une vue globale intégrant des KPI transversaux (prévalence globale, âge moyen de première consommation, section la plus active, stress moyen).
- **Cartographie Interactive :** 
  - *Mode Choroplèthe :* Remplissage territorial selon l'intensité des données.
  - *Mode Cluster :* Affichage des concentrations d'échantillons sans révéler les coordonnées exactes (anonymisation spatiale).
- **Enrichissement de Benchmark :** Inclusion automatique d'une référence nationale pour les utilisateurs régionaux, sans compromettre la confidentialité des autres régions.

### 2.4 Module 4 : Gestion des Accès et des Rôles (RBAC)
Le système doit imposer une ségrégation stricte des données selon le rôle :
- **Utilisateur (Établissement) :** Accès limité aux données agrégées de son propre établissement. Aucune carte géographique n'est affichée.
- **Administrateur (Régional/Gouvernorat) :** Accès aux données de sa région uniquement, enrichies par des moyennes nationales comparatives. Carte figée sur la région.
- **Super Administrateur (National) :** Accès complet, vision nationale, capacité de drill-down jusqu'aux clusters d'établissements, accès au moteur de corrélation IA.

---

## 3. Spécifications Techniques

### 3.1 Architecture du Système
- **Frontend :** 
  - Framework : React 19 (via Vite)
  - Styling : Tailwind CSS, Framer Motion
  - Visualisation : Recharts, D3.js, MapLibre GL
- **Backend :**
  - Framework : Django & Django REST Framework (Python)
  - Base de données : SQLite (environnement actuel) / PostgreSQL (production recommandée)
  - Traitement Asynchrone : Celery, Redis (pour le moteur de corrélation)
- **Data Science & ML :**
  - Bibliothèques : Scikit-Learn, Pandas, Mlxtend (Apriori), SciPy

### 3.2 Exigences Non-Fonctionnelles
- **Performances :** 
  - La page d'accueil du tableau de bord (Homepage API) doit charger en moins de 2 secondes.
  - Les calculs de corrélation lourds doivent s'exécuter en arrière-plan avec un mécanisme de polling côté client (mise à jour d'état toutes les 2 secondes).
- **Sécurité et Confidentialité :**
  - **Anonymisation :** Les coordonnées GPS des établissements doivent être cryptées en base de données et traitées par DBSCAN pour ne restituer que des centroïdes (clusters).
  - Aucune information d'identification personnelle (PII) directe des mineurs ne doit être traitée.
- **Interopérabilité :** Capacité future à exporter les données formatées vers le système SIDRA (Système d'Information sur les Drogues et les Risques à l'Adolescence).

---

## 4. Livrables et Critères d'Acceptation
1. **Code Source & Plateforme :** Répertoire Git complet incluant le backend (Django), le frontend (React) et le pipeline ML.
2. **Modèles Analytiques :** Fichiers d'entraînement et scripts de traitement pour l'OCR, la prédiction de stress et l'analyse des corrélations.
3. **Documentation :**
   - *README & Architecture :* Instructions de déploiement et configuration des environnements virtuels.
   - *Spécifications Data :* Documentation du modèle de données MedSPAD 2026.
4. **Validation Qualité :** Respect de la stricte parité 1:1 entre le schéma de la base de données et le questionnaire papier MedSPAD 2026.

---
*Ce document fige les attentes technico-fonctionnelles du socle de l'application Sentinelle. Toute évolution majeure fera l'objet d'un avenant.*
