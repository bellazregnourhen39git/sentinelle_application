# CAHIER DES CHARGES TECHNICO-FONCTIONNEL (CCTF)
## PROJET SENTINELLE — MedSPAD 2026
### Plateforme Nationale de Suivi Épidémiologique et de Gestion des Données d'Addictologie

---

## 1. PRÉSENTATION GÉNÉRALE

### 1.1 Contexte du Projet
Le projet **SENTINELLE** s'inscrit dans le cadre exclusif de l'enquête épidémiologique nationale **MedSPAD 2026** (Mediterranean School Survey Project on Alcohol and Other Drugs). Historiquement, la collecte des données relatives aux conduites addictives chez les adolescents en Tunisie reposait sur des processus de traitement papier laborieux. Ces méthodes traditionnelles engendraient des délais de traitement massifs, une dégradation de la fiabilité des données due aux erreurs de saisie manuelle, et une incapacité à fournir des analyses statistiques croisées en temps réel aux décideurs de la santé publique. 
Aujourd'hui, face à la complexification des comportements (polyconsommation, usage de nouvelles substances psychoactives, etc.), il est impératif de moderniser cette infrastructure via une plateforme web intégrée, hautement sécurisée, et capable d'automatiser l'ensemble de la chaîne de valeur de la donnée.

### 1.2 Objectifs du Projet
La création de la plateforme SENTINELLE vise à répondre à des objectifs stratégiques, opérationnels et techniques précis :
- **Modernisation de la Collecte :** Automatiser la transcription des formulaires papier via un moteur de Reconnaissance Optique de Caractères (OCR) robuste, couplé à une interface de validation humaine ergonomique.
- **Fiabilisation des Données :** Imposer un contrôle d'intégrité strict basé sur la topologie exacte du questionnaire MedSPAD 2026 (composé de 21 sections distinctes).
- **Accélération de la Prise de Décision :** Remplacer les rapports statiques annuels par des tableaux de bord dynamiques, interactifs et mis à jour en temps réel.
- **Sécurisation de l'Information :** Garantir l'anonymat absolu des répondants (mineurs) par une ségrégation rigoureuse des accès (RBAC) et l'obfuscation des données géographiques.
- **Interopérabilité Nationale :** Permettre un export structuré et standardisé vers le système national SIDRA (Système d’Information sur les Drogues et les Risques à l’Adolescence).

### 1.3 Périmètre du Projet (Inclusions et Exclusions)
**Inclus dans le périmètre (In-Scope) :**
- Développement du Backend (API RESTful sous Django).
- Développement du Frontend interactif (React.js/Vite).
- Intégration d'un pipeline d'extraction OCR basé sur Tesseract pour la lecture automatisée des scans.
- Mise en œuvre d'un moteur de statistiques descriptives et de corrélations mathématiques classiques (croisement de variables, calculs de prévalence, tests statistiques de base).
- Module de cartographie interactive (Choroplèthe) des 24 gouvernorats.
- Gestion granulaire des rôles utilisateurs (5 niveaux d'accès).
- Module de gestion des rapports de classe administratifs (ClassReport) et génération de QR Codes.

**Exclu du périmètre (Out-of-Scope) :**
- **Machine Learning et Intelligence Artificielle :** Le système ne comportera aucun algorithme d'apprentissage automatique, de réseaux de neurones, de prédiction par IA ou de traitement du langage naturel. Toute l'analyse sera strictement basée sur des modèles de statistiques descriptives et des agrégations SQL/mathématiques exactes.
- Applications mobiles natives (iOS/Android) dédiées aux stores. L'accès se fait exclusivement via navigateur web (Responsive Design).
- Intervention clinique ou messagerie directe avec les élèves/patients.
- Matériel physique (les scanners haute résolution doivent être fournis par le client).

### 1.4 Acteurs et Parties Prenantes
- **Commanditaire / Maîtrise d'Ouvrage (MOA) :** Ministère de la Santé (Observatoire National, ONMNE).
- **Utilisateurs Finaux (End-Users) :** 
  - Décideurs Nationaux (Super Administrateurs, Administrateurs Globaux).
  - Analystes Régionaux (Directions Régionales de la Santé).
  - Praticiens et Opérateurs (Médecins de santé scolaire, directeurs d'établissement, agents de saisie).
- **Maîtrise d'Œuvre (MOE) :** Équipe d'ingénierie logicielle responsable du développement de la solution.

---

## 2. EXIGENCES FONCTIONNELLES (BESOINS MÉTIER)

### 2.1 Module de Collecte et Numérisation (Pipeline OCR)
Le système doit soulager les opérateurs de la saisie manuelle intégrale des milliers de formulaires.
- **Acquisition Multi-Formats :** Le système doit accepter le téléversement (upload) de lots de scans au format PDF, JPEG ou PNG.
- **Moteur d'Extraction OCR :** Intégration de la bibliothèque Tesseract pour détecter les cases à cocher et le texte libre. Le moteur doit être calibré pour mapper les résultats directement sur la structure de la base de données.
- **Interface de Validation (Human-in-the-Loop) :** La plateforme proposera un écran scindé : à gauche, le scan original ; à droite, les valeurs extraites. L'opérateur doit valider les champs incertains avant soumission en base de données.
- **Règles de Cohérence Logique :** Avant la sauvegarde, le système exécutera des scripts de validation (ex: incohérence si un élève déclare avoir consommé du tabac au cours des 30 derniers jours, mais coche "Jamais" pour la consommation à vie).

### 2.2 Module de Gestion du Formulaire MedSPAD (21 Sections)
Le cœur du système est la reproduction numérique fidèle du questionnaire MedSPAD 2026.
- **Structure de Données Complexe :** La base de données doit refléter l'intégralité des 21 sections (de la Section A - Données démographiques à la Section Z - Indice de sincérité), intégrant des échelles de réponse standardisées complexes (ex: échelles de fréquence de consommation, échelles d'âge de première utilisation).
- **Saisie Manuelle (Interface Web) :** En cas d'échec du scan ou de choix opérationnel, un formulaire web complet, ergonomique et bilingue (Français/Arabe) doit permettre la saisie manuelle fluide des 21 sections.
- **Questionnaire Dynamique :** Un système d'administration permettant d'ajouter des questions spécifiques supplémentaires sans nécessiter de redéploiement informatique (Dynamic Question Engine).

### 2.3 Module de Tableaux de Bord et Visualisation (Dashboarding)
L'interface de restitution des données doit être le point fort de l'application.
- **Navigation Radiale ("Radial Section Wheel") :** Une interface de navigation graphique circulaire unique permettant à l'utilisateur de passer d'une section du questionnaire à l'autre. Le remplissage visuel de chaque segment de la roue doit refléter l'intensité des données recueillies.
- **Page d'Accueil Analytique (Homepage) :** Synthèse affichant les indicateurs clés de performance (KPI) : nombre total de soumissions, prévalence globale des substances, âge moyen de première consommation, et indicateurs d'intégrité de l'enquête.
- **Cartographie Interactive :** Affichage d'une carte de la Tunisie (TunisiaChoropleth). 
  - Pour le niveau national : coloration thématique des 24 gouvernorats en fonction du taux de prévalence.
  - Outil de zoom pour analyser la densité des soumissions.

### 2.4 Module de Rapports et Statistiques Descriptives
L'analyse des données se fera via de puissants moteurs de requêtes bases de données, sans recours à l'IA.
- **Agrégations et Prévalences :** Calcul en temps réel des taux de consommation par établissement, par région et au niveau national (via les fonctions d'agrégation de Django ORM).
- **Matrice de Croisement de Variables :** Fonctionnalité permettant de croiser dynamiquement deux axes d'analyse (ex: Sexe vs Prévalence de consommation de cannabis) et d'afficher les résultats sous forme de graphiques (Recharts : barres empilées, graphiques en secteurs).
- **Analyse des Comorbidités :** Algorithmes statistiques calculant les taux de co-occurrence de plusieurs facteurs de risque (ex: pourcentage d'élèves déclarant une cyberaddiction ET une consommation d'alcool).
- **Benchmarking Automatisé :** Pour un analyste régional, affichage du différentiel (delta en points de pourcentage) entre les statistiques de sa région et la moyenne nationale consolidée.

### 2.5 Gestion des Utilisateurs et Rôles (RBAC - Role-Based Access Control)
L'application doit intégrer une matrice de droits d'accès stricte composée de cinq (5) profils étanches :
1. **SUPER_ADMIN :** Accès global, gestion des comptes utilisateurs, accès à toutes les données nationales, configuration des dictionnaires de terminologie, exports bruts massifs.
2. **GLOBAL_ADMIN :** Accès analytique de niveau national (lecture seule sur l'ensemble du territoire).
3. **REGIONAL_ANALYST :** Accès strictement limité aux données de son propre gouvernorat d'affectation. Le système doit bloquer mathématiquement toute tentative de visualisation des données des 23 autres gouvernorats.
4. **PRACTITIONER :** Rattaché à un établissement scolaire spécifique. Peut créer des rapports de classe, distribuer des QR codes et voir les statistiques consolidées de son lycée.
5. **OPERATOR :** Opérateur de saisie pure. A accès au module de scan/OCR et de formulaire manuel, sans aucun accès aux tableaux de bord analytiques.

- **Workflow d'Invitation :** L'inscription libre est interdite. La création de compte se fait par l'envoi d'un jeton d'invitation (token) sécurisé par email, valable 48 heures.

### 2.6 Module Administratif des Sessions (ClassReports)
- Les données ne sont pas soumises "dans le vide". Chaque lot de questionnaires doit être rattaché à un "Rapport de Classe" documentant le contexte de l'enquête (nombre d'élèves présents, absents, niveau de perturbation, temps de passation).
- Génération de QR Codes spécifiques à une session permettant aux élèves de répondre via un appareil externe si nécessaire (mode Kiosk).

---

## 3. EXIGENCES NON-FONCTIONNELLES (BESOINS TECHNIQUES)

### 3.1 Architecture du Système
La plateforme adoptera une architecture moderne de type "Single Page Application" (SPA) découplée :
- **Frontend (Client UI) :** Développé en React 19, compilé via Vite. L'interface utilisera Tailwind CSS pour le style et Framer Motion pour les animations.
- **Backend (Serveur d'API) :** Propulsé par Python et le framework Django 6.0, avec Django REST Framework pour exposer les endpoints API.
- **Gestion des Tâches Lourdes :** Utilisation de Celery avec un broker Redis pour exécuter les exports volumineux et les extractions OCR en arrière-plan (processus asynchrones) sans bloquer les requêtes HTTP de l'utilisateur.

### 3.2 Gestion de la Base de Données
- Le système utilisera PostgreSQL comme Système de Gestion de Base de Données Relationnelle (SGBDR) en production.
- La base de données devra être modélisée de manière optimale (indexation des clés étrangères, utilisation des champs JSONB pour les questions dynamiques) afin de supporter un volume estimé à plus de 150 000 formulaires sans dégradation de performance.

### 3.3 Sécurité, Confidentialité et RGPD
La protection des données de santé des mineurs est le risque majeur du projet.
- **Chiffrement :** Utilisation exclusive du protocole TLS 1.3 (HTTPS) pour le trafic réseau. Les mots de passe seront hachés via l'algorithme PBKDF2 ou Argon2.
- **Anonymisation :** Aucune donnée directement nominative (nom de l'élève) n'est collectée.
- **Obfuscation Géographique :** Les coordonnées exactes des établissements ne seront jamais transférées au Frontend. Un algorithme de clustering côté serveur regroupera les points proches pour n'afficher que des macro-zones (clusters de confidentialité).
- **Traçabilité (Audit Trail) :** Toutes les actions sensibles (connexion, téléchargement CSV, modification de données, approbation d'un utilisateur) seront enregistrées dans un journal d'audit en base, incluant l'adresse IP, la date, l'utilisateur et la nature de l'opération.

### 3.4 Performances et Scalabilité
- **Temps de réponse (Latence) :** Le chargement de la page d'accueil d'un tableau de bord avec les agrégations nationales doit s'effectuer en moins de 2.0 secondes.
- L'architecture de l'API devra utiliser intensivement l'optimisation des requêtes (`select_related`, `prefetch_related`) pour éviter le problème "N+1 queries" inhérent aux ORM.

### 3.5 Interopérabilité et Exports
- **Export SIDRA :** Un point de terminaison d'API REST dédié, sécurisé par un jeton d'authentification spécifique, permettra à la plateforme étatique SIDRA d'aspirer les métriques globales agrégées.
- **Export Raw Data :** L'application doit permettre aux Super Administrateurs d'exporter la totalité des données brutes en format CSV propre pour des retraitements externes sur SPSS ou SAS. Cet export s'appuiera sur la fonction `StreamingHttpResponse` pour contourner les limites de mémoire vive du serveur.

---

## 4. EXIGENCES ERGONOMIQUES ET DESIGN (UI/UX)

- **Charte Graphique "Dark Mode" :** L'application ciblera une esthétique moderne et analytique à fond sombre (Dark Mode natif), optimisant le contraste des graphiques de données et réduisant la fatigue visuelle des analystes.
- **Responsivité (Responsive Design) :** Les tableaux de bord principaux cibleront une résolution Desktop/Tablette. Cependant, les pages de saisie de formulaires et de consultation des rapports de classe devront être parfaitement utilisables sur des terminaux mobiles.
- **Internationalisation (i18n) :** L'ensemble de l'interface utilisateur (menus, questions, rapports) sera développé pour supporter nativement le basculement dynamique entre la langue Française et la langue Arabe.

---

## 5. HÉBERGEMENT ET DÉPLOIEMENT

- **Conteneurisation :** L'intégralité de la solution (Frontend Nginx, Backend Gunicorn/Uvicorn, Celery Workers, Redis, PostgreSQL) sera encapsulée dans des conteneurs Docker.
- Un manifeste `docker-compose.yml` complet sera fourni pour le déploiement sur les serveurs du Ministère.
- L'architecture sera conçue de manière "Stateless" (sans état), permettant à terme un déploiement sous Kubernetes pour une scalabilité horizontale en cas de charge nationale massive.

---

## 6. LIVRABLES ET CRITÈRES D'ACCEPTATION

| N° | Livrable | Description |
|---|---|---|
| 1 | **Code Source Complet** | Code source versionné, documenté et livré sur un dépôt sécurisé (Git). |
| 2 | **Application Fonctionnelle** | Plateforme web déployée sur un environnement de Recette (UAT) puis de Production. |
| 3 | **Scripts de Base de données** | Schémas de base de données initiaux, scripts de migration et données de référence (Liste des gouvernorats). |
| 4 | **Documentation Technique** | Fichier README détaillant les procédures d'installation, de configuration (variables d'environnement) et de déploiement Docker. |
| 5 | **Manuels Utilisateurs** | Un guide PDF détaillé pour chaque niveau de rôle (Super Admin, Analyste Régional, Praticien, Opérateur). |

---

## 7. PLANIFICATION ET PHASAGE (PLANNING)

Le projet suivra une méthodologie itérative avec un découpage en quatre (4) phases principales :

- **Phase 1 : Socle Architectural et Base de Données (Mois 1)**
  - Modélisation du schéma de données complet (les 21 sections du MedSPAD).
  - Mise en place du module d'authentification JWT et de la matrice de rôles (RBAC).
- **Phase 2 : Collecte des Données et OCR (Mois 2)**
  - Développement de l'interface Frontend du questionnaire (React).
  - Implémentation du moteur Tesseract et de l'interface de validation des scans.
  - Gestion des ClassReports.
- **Phase 3 : Business Intelligence et Tableaux de Bord (Mois 3-4)**
  - Développement de la roue radiale de navigation.
  - Implémentation de la cartographie (Choroplèthe).
  - Création des vues statistiques backend et intégration de la bibliothèque Recharts.
- **Phase 4 : Recette, Sécurisation et Déploiement (Mois 5)**
  - Phase de test intensif (tests d'intégration, vérification des règles de sécurité de l'API).
  - Audit de l'anonymisation des données.
  - Formation des équipes de l'ONMNE et mise en production.

---
**FIN DU CAHIER DES CHARGES**  
*Document de spécifications techniques et fonctionnelles. Version de référence.*
