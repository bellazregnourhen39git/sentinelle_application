# Project Initiation Document (PID)
## Sentinelle : Plateforme d'Intelligence Épidémiologique et de Prévention des Addictions (MedSPAD 2026)

---

## 1. Executive Summary
**Sentinelle** is a state-of-the-art digital epidemiological platform engineered specifically for the **MedSPAD 2026** (Mediterranean School Survey Project on Alcohol and Other Drugs) initiative in Tunisia. This platform revolutionizes the collection, digitization, and analysis of large-scale public health data concerning youth addiction and behavioral risks. By integrating optical character recognition (OCR) pipelines, a machine learning predictive engine, and advanced data visualization, Sentinelle empowers public health officials to transition from retrospective observation to proactive, targeted intervention.

## 2. Project Background & Business Case
Historically, the MedSPAD survey relied on manual data entry from thousands of paper forms, resulting in significant delays, high error rates, and static reporting. In the current landscape, the rapid emergence of New Psychoactive Substances (NPS), e-cigarettes, and rising psychological distress among high school students necessitates real-time intelligence. 

Sentinelle is built to solve this critical latency. By automating data ingestion and leveraging an AI-driven predictive model (Voting Regressor) to assess student stress levels, the project delivers immediate, actionable insights into the correlations between mental health and addictive behaviors.

## 3. Project Objectives
1. **Automate Data Ingestion:** Eliminate manual data entry bottlenecks through a highly accurate, Tesseract-based OCR pipeline tailored for the 21 sections of the MedSPAD 2026 questionnaire.
2. **Enable Real-Time Epidemiological Visualization:** Deploy a dynamic, role-based dashboard (User, Admin, Super Admin) featuring a central radial navigation wheel to explore prevalence data across 24 governorates.
3. **Predictive Risk Modeling:** Implement an ensemble machine learning pipeline to predict underlying student stress, highlighting hidden drivers of addiction.
4. **Uncover Deep Correlations:** Provide a robust correlation engine to identify statistical associations between demographic factors, substance abuse severity, and geographic clustering (DBSCAN).
5. **Ensure Data Privacy and Compliance:** Maintain strict anonymization of minor student data while delivering granular, location-based intelligence.

## 4. Project Scope
### 4.1 In Scope
*   **OCR Pipeline:** Automated ingestion of paper forms with human-in-the-loop validation against strict JSON schemas.
*   **Predictive AI Engine:** Voting Regressor model for stress level prediction and behavioral risk scoring.
*   **Dashboard & Analytics:** 21-section radial interface, map-based geographical heatmaps (choropleth and cluster modes), and statistical correlation modules (co-occurrence, severity matrices).
*   **Role-Based Access Control (RBAC):** Three distinct access tiers ensuring data compartmentalization:
    *   *Super Admin (National level)*: Full visibility, geographic drill-down capabilities.
    *   *Admin (Regional/Gouvernorate level)*: Confined to regional data with anonymized national benchmarks.
    *   *User (School level)*: Confined to institution-specific aggregates.

### 4.2 Out of Scope
*   Direct interventions or communications with students/patients.
*   Collection of personally identifiable information (PII) such as student names or exact addresses.

## 5. Deliverables
1.  **Sentinelle Web Application:** Fully functional React 19 frontend and Django REST Framework backend.
2.  **Machine Learning Models:** Serialized predictive models (Scikit-Learn) and correlation algorithms (Apriori, DBSCAN).
3.  **Analytics Dashboard:** Interactive DataVis interface utilizing Recharts and MapLibre GL.
4.  **Technical Documentation:** Comprehensive architecture diagrams, API contracts, and deployment guides.

## 6. Stakeholders & Organization
*   **Project Sponsor:** Ministry of Health & National Observatory of New and Emerging Diseases (ONMNE).
*   **End Users:** Epidemiologists, Regional Health Directors, Addictology Practitioners, School Administrators.
*   **Project Team:** Data Scientists, Full-Stack Engineers, UX/UI Designers, Medical Subject Matter Experts.

## 7. Key Risks and Mitigation Strategies
| Risk Category | Description | Mitigation Strategy |
| :--- | :--- | :--- |
| **Data Quality** | OCR misinterpretation of handwriting. | Mandatory human-in-the-loop validation UI and strict schema enforcement. |
| **Data Privacy** | Exposure of sensitive student data. | Aggregation-only views for lower tiers; encryption of coordinates; DBSCAN clustering to mask individual locations. |
| **User Adoption** | Resistance to transitioning from legacy systems. | Intuitive UI design (radial wheel); automated insight generation to instantly demonstrate value. |
| **Performance** | Correlation engine timeouts on large datasets. | Asynchronous processing via Celery and Redis with frontend polling. |

## 8. Success Criteria
*   **100%** structural parity with the official MedSPAD 2026 questionnaire.
*   **< 2 seconds** load time for complex dashboard aggregations.
*   Zero data breaches or PII exposures.
*   Successful deployment and utilization across all 24 Tunisian governorates.
