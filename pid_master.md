# PROJECT INITIATION DOCUMENT (PID)
## SENTINELLE — MedSPAD 2026
### National Epidemiological Data Management & Analytics Platform

---

## 1. EXECUTIVE SUMMARY
**SENTINELLE** is a comprehensive digital data collection and epidemiological intelligence platform engineered for the MedSPAD 2026 (Mediterranean School Survey Project on Alcohol and Other Drugs) initiative across all 24 Tunisian governorates. It fundamentally modernizes the traditional, paper-based addiction survey lifecycle by transitioning it into an automated, highly secure digital system. By combining high-throughput OCR scanning, exact 1:1 database modeling of the 21-section MedSPAD questionnaire, and an interactive spatial analytics dashboard, SENTINELLE empowers public health authorities to process, visualize, and analyze epidemiological data with unprecedented speed and accuracy.

## 2. PROJECT BACKGROUND & BUSINESS CASE
### 2.1 The Problem
Historically, the MedSPAD survey relied on entirely manual data entry processes. This created a massive bottleneck, resulting in delays of up to a year between raw data collection and actionable policy analysis. Furthermore, manual transcription introduces significant error rates, and the static nature of the resulting PDF reports prevented public health officials from dynamically cross-referencing behavioral variables or tracking regional trends effectively.

### 2.2 The Strategic Imperative
The explosion of New Psychoactive Substances (NPS), poly-substance abuse, and e-cigarette usage among high school students demands an agile intelligence apparatus. Sentinelle capitalizes on this urgency by providing a platform that digitizes the intake process via Optical Character Recognition (OCR), validates the data immediately against business rules, and exposes the aggregated results through a dynamic, real-time dashboard.

## 3. PROJECT OBJECTIVES
1. **Automate Data Ingestion via OCR:** Deploy a Tesseract-based Optical Character Recognition pipeline with an integrated "Human-in-the-loop" validation interface to rapidly digitize complex 21-section paper forms.
2. **Deploy an Interactive Epidemiological Dashboard:** Launch a zero-latency, role-scoped visualization hub featuring a proprietary "Radial Section Wheel" for navigation, accompanied by interactive DataVisualization elements (Recharts) and 3D choropleth mapping.
3. **Execute Comprehensive Statistical Analytics:** Utilize advanced SQL and mathematical aggregations to automatically calculate usage prevalence, variable cross-tabulations, and comorbidity ratios without the need for black-box AI algorithms.
4. **Enforce Military-Grade Data Privacy:** Guarantee 100% PII protection through AES-256 encryption at rest, geographical coordinate obfuscation (spatial clustering), and a strict 5-tier Role-Based Access Control (RBAC) architecture preventing any cross-regional data leakage.
5. **Achieve National Interoperability:** Provide a secure, high-speed API endpoint for federated data export to the national SIDRA platform, as well as CSV streaming capabilities for statistical research tools (SPSS/SAS).

## 4. PROJECT SCOPE (INCLUSIONS & EXCLUSIONS)
### 4.1 In Scope
- **Data Digitization Architecture:** Full exact mapping of the 21-section MedSPAD 2026 questionnaire, including bilingual (FR/AR) data entry interfaces and strict validation scales.
- **OCR Pipeline:** High-throughput scan ingestion interface (ScanPage) backed by Tesseract, alongside a side-by-side human validation interface.
- **Administrative Workflows:** ClassReport management, QR code generation for sessions, and secure token-based user invitations.
- **RBAC Architecture:** 5 hermetically isolated roles (SUPER_ADMIN, GLOBAL_ADMIN, REGIONAL_ANALYST, PRACTITIONER, OPERATOR).
- **Analytics & Dashboarding:** Sentinelle Dashboard with RadialSectionWheel, TunisiaChoropleth mapping, and Statistical Correlation modules.
- **Extensibility:** Dynamic Question Engine allowing admins to inject new variables without code deployment.
- **System APIs:** RESTful API architecture covering authentication, metrics calculation, and SIDRA export.

### 4.2 Out of Scope
- **Machine Learning & Artificial Intelligence:** The system relies strictly on exact mathematical and statistical calculations, database queries, and traditional algorithms. There is no training of AI models, no neural networks, and no predictive machine learning pipelines.
- Direct clinical intervention or telemedicine features.
- Processing of direct personal identifiers (student names, exact residential coordinates).
- Native iOS/Android mobile application development (the web platform is fully responsive).

## 5. TECHNICAL ARCHITECTURE & INFRASTRUCTURE
### 5.1 Technology Stack
- **Frontend Layer:** Single Page Application (SPA) built with React 19 and Vite. State management via Context API/Zustand. Styling orchestrated by Tailwind CSS. Data visualization powered by Recharts, D3.js, and MapLibre GL.
- **Backend API Layer:** Python 3.10+, Django 6.0, Django REST Framework 3.17 providing robust, scalable REST APIs. Authentication via JWT (JSON Web Tokens).
- **Asynchronous Processing:** Celery background workers and a Redis message broker handle heavy data exports, OCR processing, and complex statistical aggregate pre-calculations to ensure the web server remains highly responsive.
- **Database Layer:** PostgreSQL 16 configured for High Availability (HA) to handle heavy read/write concurrency. Heavy utilization of native JSONB fields for dynamic questionnaire storage.
- **Deployment Infrastructure:** Docker containerization orchestrated via Kubernetes (K8s) or Docker Compose, ensuring seamless horizontal scaling.

### 5.2 Security Architecture
- **Encryption:** TLS 1.3 in transit, AES-256 at rest for database volumes.
- **Spatial Obfuscation:** GPS coordinates are processed server-side through a clustering algorithm ensuring that the frontend only ever receives obfuscated regional centroids, making reverse-identification of specific schools impossible.
- **Audit Logging:** Every system interaction (login, data query, terminology edit, user deletion) is permanently logged with IP address, user identity, and accurate timestamp.
- **Brute-Force Protection:** Account locking mechanisms enforced at the API level upon successive authentication failures.

## 6. PROJECT MILESTONES & TIMELINE
The project follows an iterative Agile delivery methodology consisting of four major phases:
- **Phase 1 (Month 1): Architecture & Foundation.** Backend Data Modeling of the 21 sections, JWT Authentication Architecture, and RBAC matrix implementation.
- **Phase 2 (Month 2): Data Collection.** React Frontend Questionnaire Form, OCR Tesseract integration, and Administrative ClassReport workflows.
- **Phase 3 (Month 3-4): Business Intelligence.** Radial Navigation, MapLibre 3D integration, Recharts integration, and strict RBAC enforcement on statistical views.
- **Phase 4 (Month 5): Security & Launch.** Security Auditing, Load Testing, User Training, Production Kubernetes Deployment, and SIDRA API Testing.

## 7. RISK REGISTER & MITIGATION
| Risk ID | Severity | Risk Description | Mitigation Strategy |
| :--- | :--- | :--- | :--- |
| RISK-01 | HIGH | OCR misinterpretation of scanned handwriting | Integration of a side-by-side human validation UI; strict JSON schema enforcement; cross-variable logical consistency checks. |
| RISK-02 | HIGH | PII exposure via location data | Server-side clustering algorithms ensuring individual school pins are never rendered or transmitted to the client. |
| RISK-03 | HIGH | Cross-governorate data leakage | Hard server-side authority overrides in API views; the `REGIONAL_ANALYST` scope is enforced at the database query level regardless of URL manipulation. |
| RISK-04 | MEDIUM | Server timeout on massive statistical queries | Offload heavy aggregations and CSV exports to asynchronous Celery tasks, leveraging Redis caching for dashboard homepages. |

## 8. SUCCESS CRITERIA & DELIVERABLES
- **100% structural parity** with the official MedSPAD 2026 paper questionnaire.
- **< 2 seconds API response time** for complex national dashboard rendering.
- **Zero PII exposures** during the entirety of the project lifecycle.
- **Delivery of Source Code** via secured Git repository, accompanied by Docker deployment manifests.
- **Comprehensive User Manuals** detailing operations for Operators, Practitioners, Regional Analysts, and Super Admins.
- Successful API interoperability demonstration with the national SIDRA platform.

---
*Document Version 1.1 — Approved by the Sentinelle Project Steering Committee.*
