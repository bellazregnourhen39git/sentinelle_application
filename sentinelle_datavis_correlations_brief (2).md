# Sentinelle — Data Visualisation & Correlations Brief
> Focused technical specification for the dashboard visualisation layer and correlation engine only.
> The form, models, auth, and API submission logic are already built. This brief covers what happens AFTER data is collected.

---

## 1. Context

The platform collects MedSPAD survey data from Tunisian high school students across 21 form sections. The data is already stored. This brief defines how that data is visualised and how hidden patterns are surfaced — for three roles (user, admin, super admin) and across all 21 sections.

---

## 2. The 21 Sections

Each section maps to a letter code from the questionnaire. Every dashboard view is organised around these sections.

| ID | Code | Section name |
|----|------|--------------|
| 1  | A | Demographics & lifestyle |
| 2  | B | Family background |
| 3  | C | Cigarettes |
| 4  | D | E-cigarettes |
| 5  | E | Nargileh / hookah |
| 6  | G | Alcohol |
| 7  | H | Tranquilisers / sedatives |
| 8  | I | Cannabis |
| 9  | J | Cocaine |
| 10 | K | Ecstasy |
| 11 | L | Heroin |
| 12 | M | Inhalants |
| 13 | N | Other substances (amphetamines, tramadol, subutex, speed, etc.) |
| 14 | P | New psychoactive substances (NPS) |
| 15 | Q | Risk perception |
| 16 | R | Social media |
| 17 | S | Video games |
| 18 | T | Gambling |
| 19 | U | Violence |
| 20 | V | Perceived stress |
| 21 | Z | Honesty index |

---

## 3. Dashboard Structure

### 3.1 The governing principle
Every dashboard is the same template for all three roles. The **scope** determines what data the API returns — not the UI structure. One React component tree, three data depths.

```typescript
type Scope =
  | { type: "national" }                        // super admin only
  | { type: "gouvernorate"; id: string }        // admin home | super admin drill-in
  | { type: "school"; id: string }              // super admin only
  | { type: "user_school" }                     // user only
```

### 3.2 Homepage — Landing State

When the user first arrives on the dashboard (no section selected), the right panel does not show the "select a section" empty state. It shows a **full homepage** with general data summarising the entire survey at the current scope. The radial wheel is visible on the left as always, but no segment is highlighted.

The homepage is **the same layout for all three roles** — scope controls the data depth, not the structure.

---

#### Homepage layout — top to bottom

**Row 1 — Scope headline**
A single line of large text contextualising what the user is looking at.
- User: `"Lycée — [N] soumissions collectées"`
- Admin: `"Gouvernorat de [name] — [N] soumissions collectées"`
- Super admin: `"Vue nationale — [N] soumissions sur 24 gouvernorats"`

Below this, a muted subtitle showing the survey wave year and data quality indicator:
`"MedSPAD 2026 · [X]% taux de complétion · [Y]% indice de fiabilité moyen"`

---

**Row 2 — Global KPI strip (5 cards)**
Five headline numbers giving an instant read on the entire dataset at the current scope. These are cross-section figures, not section-specific.

| Card | Label | Value logic |
|------|-------|-------------|
| 1 | Total soumissions | Raw count of submissions in scope |
| 2 | Prévalence globale | % of submissions with at least one substance use reported |
| 3 | Âge moyen de première consommation | Average across all substance age_first_use fields |
| 4 | Section la plus active | Name of the section with the highest intensity score |
| 5 | Indice de stress moyen | Average computed stress score from V01–V04 |

For admin scope: cards 1, 3, 4, 5 show the gouvernorate value. Card 2 shows gouvernorate value + national average benchmark delta (same delta indicator as section-level KPIs — colored arrow + pp difference).

---

**Row 3 — Group prevalence overview (horizontal bar chart)**
A single chart showing prevalence (% of respondents who reported any use) per section group — not per individual section. Five bars, one per group: Profile, Social, Addiction, Lifestyle, Awareness. Each bar uses the group's color.

This is the fastest way to answer: "Which category of behaviour is most prevalent in this scope?"

For admin: a dashed national average reference line per bar (same pattern as section charts).
For super admin at national level: bars are clickable — clicking "Addiction" filters the radial wheel to highlight only addiction segments.

---

**Row 4 — Top 5 findings strip**
Five cards in a horizontal row, each showing the single most notable metric from one of the five most data-rich sections in the current scope. These are auto-selected — the five sections with the highest submission intensity score.

Each card shows:
- Section number + name + group color badge
- One headline metric (the first KPI for that section)
- A mini sparkline or single bar showing the distribution at a glance
- A "Voir la section →" link that selects that segment in the wheel and opens its detail panel

This row gives the user actionable entry points without requiring them to explore the wheel blind.

---

**Row 5 — Map overview**
Same map rules as the section detail panel apply here (see Section 4), but showing **overall submission density** (total submissions per zone) rather than any section-specific metric. This is the geographic coverage view — where did the data come from?

- User: no map
- Admin: their wilaya filled by submission density, all others faint
- Super admin: full choropleth by submission count per gouvernorate — which wilayas have the most data

The super admin map on the homepage is also clickable — clicking a wilaya drills into that gouvernorate's homepage (not a section view — the full homepage scoped to that gouvernorate).

---

**Row 6 — Data quality summary (admin + super admin only)**
A compact row of three quality indicators:

| Indicator | Description |
|-----------|-------------|
| Taux de complétion | % of submissions with ≥ 12 of 21 sections answered |
| Fiabilité moyenne | % of submissions with reliability_tier 1 or 2 |
| Signalements | Count of submissions flagged by the consistency validator |

For admin: shown with national benchmark delta on completion rate and reliability.
For super admin: clicking "Signalements" opens the data quality management panel (out of scope for this brief — noted as a separate feature).

---

#### Homepage state vs section state

The homepage and the section detail panel occupy the same right-panel area. The transition between them is triggered by:
- Clicking a wheel segment → section detail panel (segment highlighted)
- Clicking the center circle of the wheel → return to homepage (no segment highlighted)
- Loading the dashboard fresh → homepage by default

```typescript
const [selectedSection, setSelectedSection] = useState<number | null>(null);
// null = homepage, 1–21 = section detail panel
```

---

#### Homepage API endpoint

A dedicated endpoint returns all homepage data in a single request to avoid waterfall loading:

```
GET /api/homepage/?scope_type=national|gouvernorate|user_school&scope_id=...
```

Response shape:
```typescript
interface HomepageData {
  headline: {
    scope_label: string;
    n_submissions: number;
    wave_year: number;
    completion_rate: number;
    reliability_rate: number;
  };
  kpis: KPI[];                          // always exactly 5
  group_prevalence: {
    group: string;
    color: string;
    prevalence: number;
    national_avg?: number;              // present for admin scope only
  }[];
  top_sections: {
    section_id: number;
    section_name: string;
    group: string;
    headline_kpi: KPI;
    mini_chart: { labels: string[]; values: number[]; };
  }[];                                  // always exactly 5
  map: MapData | null;
  quality?: {                           // present for admin + super admin only
    completion_rate: number;
    reliability_rate: number;
    flagged_count: number;
    completion_national_avg?: number;   // present for admin only
    reliability_national_avg?: number;  // present for admin only
  };
}
```

---

### 3.3 Navigation — Radial Section Wheel
The primary navigation is a **radial compass wheel** with all 21 sections arranged as segments around a central circle. This is the signature visual of Sentinelle.

**Wheel design rules:**
- 21 equal arc segments, small gap between each
- Each segment has two layers:
  - A faint background arc (full radius) showing the section exists
  - A colored fill arc whose **radius height = data intensity** for that section in the current scope (i.e. submission count normalised 0–1). Low data = short bar. High data = nearly full.
- Color encodes the section's group:

| Group | Color | Sections |
|-------|-------|----------|
| Profile | Purple `#7F77DD` | A, B |
| Social | Teal `#1D9E75` | U, V |
| Addiction | Coral `#D85A30` | C, D, E, G, H, I, J, K, L, M, N, P |
| Lifestyle | Amber `#EF9F27` | R, S, T |
| Awareness | Blue `#378ADD` | Q, Z |

- Section number label (1–21) shown at the outer edge of each segment
- Center circle shows platform name + total submission count
- Clicking any segment selects that section and populates the detail panel
- A pulsing ring animation on the center circle
- All 21 sections visible to all roles — only the data inside changes per scope

### 3.4 Section Detail Panel
Clicking a segment opens its detail panel. Structure is identical for all roles and all sections — four vertically stacked blocks:

**Block 1 — KPI cards (3 cards)**
Three headline numbers relevant to that section. Examples:
- Section C (Cigarettes): prevalence %, average age of first use, % with social exposure
- Section I (Cannabis): prevalence %, dependency indicator rate, % who tried to stop
- Section U (Violence): % involved in fights, % school-initiated, most common consequence
Each card shows: label (small caps), value (large, colored by section group), optional sub-label.

**Block 2 — Distribution chart**
The primary breakdown for the section. Chart type depends on the section:
- Frequency/prevalence data → horizontal bar chart
- Categorical split (e.g. gender, grade) → grouped bar or donut
- Likert/scale data (e.g. stress, risk perception) → stacked bar
- Timeline/age data → area or line chart
All charts use the section's group color as the primary color.

**Block 3 — Map block**
Geographic view. Rules differ by role — see Section 4 below.

**Block 4 — Correlations block**
Chips linking to correlated sections. Clicking a chip navigates to that section. See Section 5 below.

---

## 4. Map Rules by Role

### User
No map shown. Block 3 is hidden entirely.

### Admin
- Displays a Tunisia outline map
- Only the admin's own wilaya boundary is filled with a color intensity (hue = section group color, intensity = normalised prevalence for that section in their gouvernorate)
- All other wilaya boundaries shown as faint outlines — not filled, not clickable
- No pins, no school markers, no labels
- The map is purely informational context — it is NOT a navigation surface at admin level
- Caption below map: name of the gouvernorate + total submission count

#### Admin national benchmark enrichment
The admin sees their own numbers but never in isolation. Every part of the admin dashboard exposes a silent national reference so they always know where they stand without revealing any other gouvernorate's identity.

**KPI cards — benchmark delta indicator**
Each of the 3 KPI cards gains a small indicator beneath the value showing deviation from the national average for that metric. Format: a colored arrow + percentage point difference.
- Green arrow down = below national average (better for risk indicators)
- Red arrow up = above national average (worse for risk indicators)
- Gray dash = within ±2pp of national average

Example for Section I (Cannabis):
```
Prévalence
21%
↑ +6pp vs moyenne nationale
```

The national average shown here is a single pre-computed scalar — it does not reveal any gouvernorate breakdown. The Django serializer computes it as `Submission.objects.aggregate(...)` across all gouvernorates combined.

**Distribution chart — national average reference line**
Every bar chart and area chart in the admin's section detail panel includes a dashed horizontal reference line at the national average value for that metric. The line is labeled "Moyenne nationale" in a neutral gray. It is a single line — not a breakdown by other gouvernorates.

For stacked bar charts (Likert scales): show a small inset donut or percentage pill beside each bar comparing the admin's distribution to the national distribution for that response category.

**Radial wheel — national context ring**
The admin's radial wheel gains a second faint outer ring showing the national intensity for each section. The admin's own fill is the solid colored arc. The national average appears as a short tick mark at the corresponding radius on each segment. At a glance the admin sees: "my cannabis section is filled to 80% — the national tick is at 60% — I am above average."

**Percentile rank card**
Below the 3 KPI cards, a fourth narrow card spans the full width showing the admin's gouvernorate percentile rank for the current section across all 24 gouvernorates. Example:

```
Classement national — Section I (Cannabis)
Votre gouvernorat se situe dans le top 30% des gouvernorats
pour la prévalence de consommation de cannabis.
[████████░░░░░░░░░░░░] 30e percentile
```

No other gouvernorate is named. No other gouvernorate's value is revealed. The rank is computed server-side as a percentile position in the distribution of all 24 gouvernorate values for that metric.

**API contract addition for admin scope**
The `SectionStats` response gains a `benchmark` field when the scope is `gouvernorate` and the requesting user is an admin:

```typescript
interface SectionStats {
  // ... existing fields ...
  benchmark?: {
    national_avg: number;           // single national scalar
    delta_pp: number;               // admin value minus national avg in percentage points
    percentile_rank: number;        // 0–100, admin's position among all gouvernorates
    direction: "above" | "below" | "average";
  }
}
```

This field is computed by a dedicated Django serializer method that queries the full dataset but returns only the scalar — never a per-gouvernorate breakdown. The admin API never receives a list of other gouvernorates' values.

### Super Admin — National view
- Full Tunisia choropleth
- All 24 wilayas filled — color intensity = prevalence for the current section in that gouvernorate
- Clicking a wilaya calls `drillInto({ type: "gouvernorate", id: wilayaId })`
- Transition: full panel replacement (no modal, no drawer) with a back button appearing top-left
- Color scale legend shown below map

### Super Admin — Gouvernorate view (after drilling in)
- Map zooms to the selected wilaya
- School submission clusters shown as circle markers (radius = cluster size)
- Clusters computed server-side via DBSCAN (eps=500m). Individual pins are never shown — only cluster centroids.
- Clicking a cluster calls `drillInto({ type: "school", id: clusterId })`
- Cluster tooltip on hover: submission count + dominant section finding

### Super Admin — School view (after drilling into cluster)
- Same map zoomed to the cluster zone
- Single cluster highlighted
- Stats panel updates to show that school's data for the current section

### Back button
Single `← Back` button shown whenever the scope stack depth > 1. No breadcrumbs. No trail. Just the one button.

---

## 5. Correlation Engine

### 5.1 Trigger
On-demand only. Super admin clicks "Run analysis" in the correlations panel. Fires a Celery background task. Frontend polls for results every 2 seconds. The button shows a loading state while running.

### 5.2 Filters (applied before any analysis)
The super admin can filter the analysis by:
- Addiction type (one or more sections)
- Gouvernorate (one, several, or all)
- Age group
- Gender
- Time period

These filters narrow the `Submission` queryset before the four modules run.

### 5.3 Honesty weighting
Submissions with `honesty_alcohol` or `honesty_cannabis` = 4 or 5 ("probably not" / "definitely not honest") are flagged. A toggle in the correlations panel lets the super admin exclude low-honesty submissions from the analysis. Default: included but flagged.

### 5.4 Four Analysis Modules

---

#### Module 1 — Co-occurrence (association rule mining)

**What it finds:** Which section responses tend to appear together in the same submission. E.g. cannabis use + violent behaviour, gambling + alcohol binge, high stress + high social media use.

**Method:**
```python
import pandas as pd
from mlxtend.frequent_patterns import apriori, association_rules

# Build one-hot encoded presence flags per submission
# e.g. cannabis_user=True if can_freq_lifetime > 1
# violent=True if viol_fights_12m > 1
# gambler=True if gamb_freq_12m > 1
ohe = pd.DataFrame({
    'cannabis': df['can_freq_lifetime'] > 1,
    'violent': df['viol_fights_12m'] > 1,
    'alcohol': df['alc_freq_12m'] > 1,
    'high_stress': df['stress_overwhelm'] >= 4,
    'social_media_dep': df['sm_dep_mood'] >= 4,
    'gambler': df['gamb_freq_12m'] > 1,
    'tranq': df['tran_freq_lifetime'] > 1,
    'ecig': df['ecig_freq_lifetime'] > 1,
    # ... etc for all meaningful binary flags
})

freq_items = apriori(ohe, min_support=0.05, use_colnames=True)
rules = association_rules(freq_items, metric='lift', min_threshold=1.2)
rules = rules[rules['confidence'] >= 0.4].sort_values('lift', ascending=False)
```

**Output:** List of rules, each with: antecedent → consequent, lift, confidence, support, n, p-value.

---

#### Module 2 — Severity × addiction type matrix

**What it finds:** Which addiction types skew toward severe/frequent cases. Is alcohol systematically associated with higher severity than cannabis? Are tranquiliser users more likely to be daily users?

**Method:**
```python
from scipy.stats import chi2_contingency
import numpy as np

# Build severity proxy: combine lifetime freq + 30d freq into a 3-level severity
# 1=mild (tried once or twice), 2=moderate, 3=severe (frequent/daily)
ct = pd.crosstab(df['addiction_type_label'], df['severity_level'])
chi2, p, dof, expected = chi2_contingency(ct)
n = ct.values.sum()
cramers_v = np.sqrt(chi2 / (n * (min(ct.shape) - 1)))

# Standardised residuals — cells > 2 are significant deviations
residuals = (ct - expected) / np.sqrt(expected)
```

**Output:** Crosstab heatmap data + chi2 + p-value + Cramér's V + flagged cells where |residual| > 2.

---

#### Module 3 — Demographic patterns

**What it finds:** Which age groups or genders are disproportionately represented in specific addiction types or behaviours.

**Method:** Same chi-square approach, applied to:
- `gender × addiction_type`
- `age_group × addiction_type` (age derived from birth_year)
- `academic_grade × addiction_type`
- `economic_status × addiction_type`

Flag cells with |standardised residual| > 2. Translate to plain-language: "Males are 3.1× more likely to present severe cannabis use than females."

**Output:** Per-demographic residual matrix + plain-language findings ranked by effect size.

---

#### Module 4 — Geographic clustering

**What it finds:** Spatial hotspots where a specific pattern clusters geographically beyond random chance.

**Method:**
```python
from sklearn.cluster import DBSCAN
import numpy as np

# Filter submissions by pattern (e.g. severe cannabis users)
filtered = df[df['cannabis_severe'] == True]

# Decrypt coordinates for filtered set only
coords = np.array([decrypt_coords(row.location_encrypted)
                   for row in filtered.itertuples()
                   if row.location_encrypted])

# DBSCAN in radians for haversine metric
coords_rad = np.radians(coords)
eps_rad = 500 / 6371000  # 500m in radians
db = DBSCAN(eps=eps_rad, min_samples=5, algorithm='ball_tree', metric='haversine')
labels = db.fit_predict(coords_rad)

# For each cluster: centroid, size, density ratio vs gouvernorate baseline
```

**Output:** List of clusters with: centroid lat/lng, size, density_ratio (vs baseline), p-value. Rendered as radius circles on the map overlay, color intensity = density ratio.

---

### 5.5 Insight Card Format

Each finding from any module is surfaced as an insight card in the UI.

```
┌──────────────────────────────────────────────────────────────┐
│  [confidence ring]  TYPE BADGE                               │
│                     Plain-language finding in French         │
│                     (association language only, never causal) │
│                     [lift X.X] [p < 0.001] [n = 1,204]      │
└──────────────────────────────────────────────────────────────┘
```

**Confidence score** = combined metric from p-value + effect size:
- p < 0.001 AND effect size large (Cramér's V > 0.3 or lift > 2.0) → high confidence (red ring, 70–100%)
- p < 0.01 AND medium effect → medium confidence (amber ring, 40–70%)
- p < 0.05 AND small effect → low confidence (green ring, 20–40%)

**Insight cards are ranked** by confidence score descending. Cards below p = 0.05 are hidden by default with a "show weak findings" toggle.

**Mandatory disclaimer** always visible above the cards:
> *"Ces résultats sont des associations statistiques, non des relations causales. Ils doivent être interprétés par des professionnels qualifiés."*

---

### 5.6 Celery Task Structure

```python
@shared_task(bind=True)
def run_correlation_analysis(self, filters: dict):
    self.update_state(state='PROGRESS', meta={'step': 'loading', 'pct': 0})
    df = build_dataframe(filters)

    self.update_state(state='PROGRESS', meta={'step': 'co-occurrence', 'pct': 25})
    cooccurrence = run_cooccurrence(df)

    self.update_state(state='PROGRESS', meta={'step': 'severity matrix', 'pct': 50})
    severity = run_severity_matrix(df)

    self.update_state(state='PROGRESS', meta={'step': 'demographics', 'pct': 75})
    demographics = run_demographic_patterns(df)

    self.update_state(state='PROGRESS', meta={'step': 'geo clustering', 'pct': 90})
    geo = run_geo_clustering(df)

    results = rank_and_format_insights(cooccurrence, severity, demographics, geo)
    cache.set(f'correlations:{self.request.id}', results, timeout=3600)

    return {'status': 'complete', 'job_id': self.request.id}
```

Frontend polls `GET /api/analytics/correlations/{job_id}/` every 2s. Response shape:
```json
{
  "status": "pending | progress | complete",
  "progress": { "step": "co-occurrence", "pct": 25 },
  "data": [ ...insight cards... ]
}
```

---

## 6. Section-Level Correlation Chips

Even outside the full correlation engine run, each section detail panel shows **pre-computed correlation chips** — a lightweight set of related sections based on known MedSPAD literature relationships. These are static and always visible, not requiring a Celery run.

```python
SECTION_CORRELATIONS = {
    1:  [2, 5, 8],       # Demographics → Family, Mental health, Cannabis
    2:  [1, 3, 7],       # Family → Demographics, Cigarettes, Home dynamics
    3:  [4, 5, 9],       # Cigarettes → E-cigs, Nargileh, Tobacco (cross)
    4:  [3, 5, 16],      # E-cigs → Cigarettes, Nargileh, Social media
    5:  [3, 4, 6],       # Nargileh → Cigarettes, E-cigs, Alcohol
    6:  [5, 8, 12],      # Alcohol → Nargileh, Cannabis, Inhalants
    7:  [8, 10, 20],     # Tranquilisers → Cannabis, Ecstasy, Stress
    8:  [6, 7, 19],      # Cannabis → Alcohol, Tranquilisers, Violence
    9:  [8, 10, 12],     # Cocaine → Cannabis, Ecstasy, Inhalants
    10: [8, 9, 11],      # Ecstasy → Cannabis, Cocaine, Heroin
    11: [9, 10, 12],     # Heroin → Cocaine, Ecstasy, Inhalants
    12: [11, 13, 9],     # Inhalants → Heroin, Other subs, Cocaine
    13: [8, 9, 14],      # Other subs → Cannabis, Cocaine, NPS
    14: [8, 13, 15],     # NPS → Cannabis, Other subs, Risk perception
    15: [8, 9, 21],      # Risk perception → Cannabis, Cocaine, Honesty
    16: [17, 20, 1],     # Social media → Video games, Stress, Demographics
    17: [16, 18, 20],    # Video games → Social media, Gambling, Stress
    18: [6, 17, 19],     # Gambling → Alcohol, Video games, Violence
    19: [8, 6, 20],      # Violence → Cannabis, Alcohol, Stress
    20: [19, 16, 7],     # Stress → Violence, Social media, Tranquilisers
    21: [1, 8, 15],      # Honesty → Demographics, Cannabis, Risk perception
}
```

Each chip shows: section number + name + color badge of its group. Clicking navigates to that section (same scope, same scroll position reset).

---

## 7. Stats API Response Shape

The stats endpoint returns a consistent shape regardless of section or scope. The frontend always renders from this contract.

```typescript
interface SectionStats {
  section_id: number;
  section_code: string;
  scope: Scope;
  n_submissions: number;
  kpis: KPI[];          // always exactly 3
  chart: ChartData;     // chart type + labels + datasets
  map: MapData | null;  // null for user role
  intensity: number;    // 0–1, used by radial wheel to set fill height
}

interface KPI {
  label: string;
  value: string;        // pre-formatted server-side (e.g. "34%", "13 ans", "2.4×")
  sub?: string;
}

interface ChartData {
  type: "bar" | "donut" | "stacked_bar" | "area";
  labels: string[];
  datasets: { label: string; data: number[]; }[];
}

interface MapData {
  mode: "choropleth" | "cluster";
  gouvernorates?: { id: string; value: number; }[];   // choropleth mode
  clusters?: { lat: number; lng: number; count: number; id: string; }[];  // cluster mode
}
```

---

## 8. Key Visualisation Rules (Non-Negotiable)

1. **Radial wheel is the only section navigator.** No tabs, no sidebar list, no dropdown. The wheel is the UI.
2. **Homepage is the default landing state.** No section is pre-selected on load. The right panel shows the homepage (section 3.2) until the user clicks a wheel segment. Clicking the wheel center always returns to the homepage.
3. **Homepage uses a single API call.** All homepage data — KPIs, group prevalence, top 5 sections, map, quality indicators — is returned in one `/api/homepage/` request. No waterfall loading.
2. **All 21 sections always visible** in the wheel regardless of role. Sections with zero submissions show a minimal fill.
3. **Map is not a navigation surface for admin.** Only super admin can click the map to drill in.
11. **Admin always sees national benchmark context.** Every KPI card, every chart, and the radial wheel must expose the national average reference for the admin's scope. The benchmark is a scalar — never a per-gouvernorate breakdown. No other gouvernorate is ever named or identified in the admin view.
4. **Cluster pins only on the map, never individual submission dots.** Even for super admin.
5. **All stats computed server-side.** The frontend never receives raw rows. Always aggregated objects matching the `SectionStats` contract.
6. **Section detail panel has exactly 4 blocks** in order: KPIs → chart → map → correlations. No exceptions.
7. **Correlation disclaimer always visible** above insight cards. Not collapsible.
8. **Correlation language is associative, never causal.** Copy must use: "associé à", "corrélé avec", "plus susceptibles de" — never "cause", "provoque", "entraîne".
9. **Honesty-flagged submissions are included by default** but the toggle to exclude them is always visible in the correlations panel.
10. **Back button only when scope depth > 1.** Single button, top-left, label "← Retour". No breadcrumb trail.
