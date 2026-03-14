from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _


# ─── Geographic / Organizational models ────────────────────────────────────────

class Governorate(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


class SchoolEstablishment(models.Model):
    name = models.CharField(max_length=200)
    governorate = models.ForeignKey(Governorate, on_delete=models.CASCADE, related_name="establishments")

    def __str__(self):
        return f"{self.name} ({self.governorate.name})"


class SchoolClass(models.Model):
    name = models.CharField(max_length=100)
    establishment = models.ForeignKey(SchoolEstablishment, on_delete=models.CASCADE, related_name="classes")

    def __str__(self):
        return f"{self.name} - {self.establishment.name}"


# ─── Custom User ────────────────────────────────────────────────────────────────

class User(AbstractUser):
    class Role(models.TextChoices):
        USER = "USER", _("User (Doctor)")
        ADMIN = "ADMIN", _("Admin (Governorate)")
        SUPERADMIN = "SUPERADMIN", _("Super Admin (National)")

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.USER)
    establishment = models.ForeignKey(SchoolEstablishment, on_delete=models.SET_NULL, null=True, blank=True)
    governorate = models.ForeignKey(Governorate, on_delete=models.SET_NULL, null=True, blank=True)

    def __str__(self):
        return f"{self.username} ({self.role})"


# ─── Central Anchor ─────────────────────────────────────────────────────────────

class QuestionnaireSession(models.Model):
    class Language(models.TextChoices):
        FR = "FR", "French"
        AR = "AR", "Arabic"

    school_class = models.ForeignKey(SchoolClass, on_delete=models.CASCADE, related_name="sessions")
    school = models.ForeignKey(SchoolEstablishment, on_delete=models.CASCADE, related_name="sessions")
    governorate = models.ForeignKey(Governorate, on_delete=models.CASCADE, related_name="sessions")
    language_used = models.CharField(max_length=2, choices=Language.choices, default=Language.FR)
    created_at = models.DateTimeField(auto_now_add=True)

    # Computed risk flags for fast dashboard queries
    tobacco_user = models.BooleanField(default=False)
    ecig_user = models.BooleanField(default=False)
    hookah_user = models.BooleanField(default=False)
    alcohol_user = models.BooleanField(default=False)
    tranquilizer_user = models.BooleanField(default=False)
    cannabis_user = models.BooleanField(default=False)
    cocaine_user = models.BooleanField(default=False)
    ecstasy_user = models.BooleanField(default=False)
    heroin_user = models.BooleanField(default=False)
    inhalant_user = models.BooleanField(default=False)
    has_risk_behavior = models.BooleanField(default=False)

    def __str__(self):
        return f"Session {self.id} | {self.school} | {self.created_at.date()}"


# ─── CHOICE CONSTANTS ──────────────────────────────────────────────────────────

# Scaling from Table 18/24/29/35/43/48/79/81
FREQUENCY_LIFETIME_12M = [
    ("never", "Jamais"),
    ("1_2", "1-2 fois"),
    ("3_5", "3-5 fois"),
    ("6_9", "6-9 fois"),
    ("10_19", "10-19 fois"),
    ("20_39", "20-39 fois"),
    ("40_plus", "40 fois ou plus"),
]

# Table 19 (Cigarettes 30 days)
FREQUENCY_30DAYS_CIGS = [
    ("never", "Jamais"),
    ("lt1_week", "< 1 cigarette par semaine"),
    ("lt1_day", "< 1 cigarette par jour"),
    ("1_5_day", "1-5 par jour"),
    ("6_10_day", "6-10 par jour"),
    ("11_20_day", "11-20 par jour"),
    ("gt20_day", "> 20 par jour"),
]

# Table 25 (Ecigs 30 days)
FREQUENCY_30DAYS_VAPE = [
    ("never", "Jamais"),
    ("lt1_week", "< 1 fois par semaine"),
    ("ge1_week", "Au moins 1 fois par semaine"),
    ("daily", "Tous les jours ou presque"),
]

# Table 30 (Hookah 30 days)
FREQUENCY_30DAYS_HOOKAH = [
    ("never", "Jamais"),
    ("lt1_week", "< 1 par semaine"),
    ("lt1_day", "< 1 par jour"),
    ("1_5_day", "1-5 par jour"),
    ("6_10_day", "6-10 par jour"),
    ("11_20_day", "11-20 par jour"),
    ("gt20_day", "> 20 par jour"),
]

# Table 35/36/38/43/48/56/61/66/71 (Alcohol/Drugs 30 days)
FREQUENCY_30DAYS_STANDARD = [
    ("never", "Jamais"),
    ("1_2", "1-2 fois"),
    ("3_5", "3-5 fois"),
    ("6_9", "6-9 fois"),
    ("10_19", "10-19 fois"),
    ("20_39", "20-39 fois"),
    ("40_plus", "40 fois ou plus"),
]

# Table 3/7/90 (Sports, Internet, Gaming)
FREQUENCY_ACTIVITIES = [
    ("never", "Jamais"),
    ("few_year", "Quelques fois par an"),
    ("1_2_month", "1 ou 2 fois par mois"),
    ("ge1_week", "Au moins une fois par semaine"),
    ("daily", "Tous les jours"),
]

FREQUENCY_DIGITAL_HOURS = [
    ("none", "Aucune"),
    ("30m", "Une demi-heure ou moins"),
    ("1h", "Environ 1 heure"),
    ("2_3h", "Environ 2-3 heures"),
    ("4_5h", "Environ 4-5 heures"),
    ("6h_plus", "6 heures ou plus"),
]

# Table 20/26/31/39/44/49/57/62/67/72/77
AGE_FIRST_USE_SCALE = [
    ("never", "Jamais"),
    ("le9", "9 ans ou moins"),
    ("10", "10 ans"),
    ("11", "11 ans"),
    ("12", "12 ans"),
    ("13", "13 ans"),
    ("14", "14 ans"),
    ("15", "15 ans"),
    ("ge16", "16 ans ou plus"),
]

DIFFICULTY_ACCESS = [
    ("impossible", "Impossible"),
    ("difficult", "Difficile"),
    ("easy", "Facile"),
    ("dont_know", "Ne sait pas"),
]

SATISFACTION_FIVE = [
    ("very_satisfied", "Très satisfait(e)"),
    ("satisfied", "Satisfait(e)"),
    ("neutral", "Ni satisfait(e) ni insatisfait(e)"),
    ("not_so_satisfied", "Pas tellement satisfait(e)"),
    ("unsatisfied", "Non satisfait(e)"),
    ("na", "Non applicable"),
]

YES_NO = [("yes", "Oui"), ("no", "Non")]
SOCIAL_CIRCLE = [("yes", "Oui"), ("no", "Non"), ("dont_know", "Ne sait pas")]

FREQUENCY_STRESS = [
    ("never", "Jamais"),
    ("almost_never", "Presque jamais"),
    ("sometimes", "Parfois"),
    ("fairly_often", "Assez souvent"),
    ("very_often", "Très souvent"),
]

AGREEMENT_SCALE_SIMPLE = [
    ('strongly_agree', "Tout à fait d'accord"),
    ('agree', "D'accord"),
    ('disagree', "Pas d'accord"),
    ('strongly_disagree', "Pas du tout d'accord"),
]

HONESTY_SCALE = [
    ("admitted", "J’ai déjà déclaré [cela]"),
    ("yes_undoubtedly", "Oui, sans aucun doute"),
    ("probably_yes", "Probablement oui"),
    ("probably_no", "Probablement pas"),
    ("no_undoubtedly", "Non, sans aucun doute"),
]


# ─── Section A — Informations Générales ─────────────────────────────────────────

class SectionA(models.Model):
    session = models.OneToOneField(QuestionnaireSession, on_delete=models.CASCADE, related_name="section_a")

    gender = models.CharField(max_length=1, choices=[("M", "Masculin"), ("F", "Féminin")])
    birth_month = models.PositiveSmallIntegerField(null=True, blank=True)
    birth_year = models.PositiveSmallIntegerField(null=True, blank=True)
    
    # Activity frequencies (Table 3)
    activities_frequency = models.JSONField(default=dict, blank=True) # {sports, reading, going_out, hobbies, park, internet, tv}
    
    # Absences (Table 4)
    school_absences = models.JSONField(default=dict, blank=True) # {sick, no_desire, problems_admin, problems_friends, expelled, other}
    
    academic_performance = models.CharField(max_length=20, blank=True, choices=[
        ("below_10", "En dessous de la moyenne (<10/20)"),
        ("10_12", "Moyen [10 – 12]"),
        ("above_12", "En dessus de la moyenne (>12/20)"),
    ])
    
    # Lives with (Table 6)
    household_members = models.JSONField(default=list, blank=True) # ["father", "mother", "stepfather", ...]
    
    parents_absence_reason = models.CharField(max_length=20, blank=True, choices=[
        ("death", "Décès"), ("divorce", "Divorce"), ("migration", "Migration"), ("other", "Autre"),
    ])
    
    nights_out_30days = models.CharField(max_length=10, blank=True, choices=[
        ("0", "Aucune"), ("1", "1 nuit"), ("2", "2 nuits"), ("3", "3 nuits"),
        ("4", "4 nuits"), ("5", "5 nuits"), ("6", "6 nuits"), ("7_plus", "7 nuits ou plus"),
    ])
    
    family_relationship_satisfaction = models.JSONField(default=dict, blank=True) # {mother, father, stepmother, stepfather, siblings, friends, classmates, teachers, administration}
    
    parents_absence_reason_other = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return f"SectionA | Session {self.session_id}"


# ─── Section B — Famille et Situation Socio-Economique ──────────────────────────

class SectionB(models.Model):
    session = models.OneToOneField(QuestionnaireSession, on_delete=models.CASCADE, related_name="section_b")

    # Table 10/11
    EDUCATION_LEVEL_COMPLEX = [
        ("none", "Non scolarisé"),
        ("primary_no_6th", "Primaire (échec 6ème)"),
        ("primary_6th", "Primaire (réussi 6ème)"),
        ("college_no_9th", "Collège (échec 9ème)"),
        ("college_9th", "Collège (réussi 9ème)"),
        ("secondary_no_bac", "Secondaire (échec bac)"),
        ("secondary_bac", "Secondaire (réussi bac)"),
        ("university", "Universitaire ou plus"),
        ("vocational", "Formation professionnelle"),
        ("dont_know", "Ne sait pas"),
        ("na", "Non applicable"),
    ]

    father_education = models.CharField(max_length=20, blank=True, choices=EDUCATION_LEVEL_COMPLEX)
    mother_education = models.CharField(max_length=20, blank=True, choices=EDUCATION_LEVEL_COMPLEX)

    # Table 12/13
    EMPLOYMENT_STATUS = [
        ("full_time", "Oui, à plein temps"),
        ("part_time", "Oui, temps partiel"),
        ("unemployed", "Ne travaille pas"),
        ("retired", "Retraité(e)"),
        ("dont_know", "Je ne sais pas"),
        ("na", "Non applicable"),
    ]

    father_job = models.CharField(max_length=20, blank=True, choices=EMPLOYMENT_STATUS)
    mother_job = models.CharField(max_length=20, blank=True, choices=EMPLOYMENT_STATUS)

    economic_status = models.CharField(max_length=20, blank=True, choices=[
        ("superior", "Supérieure aux autres familles"),
        ("identical", "Identique aux autres familles"),
        ("inferior", "Inférieure aux autres familles"),
    ])

    def __str__(self):
        return f"SectionB | Session {self.session_id}"


# ─── Section C — Cigarettes ───────────────────────────────────────────────────

class SectionC(models.Model):
    session = models.OneToOneField(QuestionnaireSession, on_delete=models.CASCADE, related_name="section_c")

    access_difficulty = models.CharField(max_length=20, blank=True, choices=DIFFICULTY_ACCESS)
    family_smoke = models.CharField(max_length=10, blank=True, choices=SOCIAL_CIRCLE)
    friends_smoke = models.CharField(max_length=10, blank=True, choices=SOCIAL_CIRCLE)
    
    lifetime_freq = models.CharField(max_length=10, blank=True, choices=FREQUENCY_LIFETIME_12M)
    months_12_freq = models.CharField(max_length=10, blank=True, choices=FREQUENCY_LIFETIME_12M)
    days_30_freq = models.CharField(max_length=15, blank=True, choices=FREQUENCY_30DAYS_CIGS)
    
    age_first_use = models.CharField(max_length=10, blank=True, choices=AGE_FIRST_USE_SCALE)
    age_daily_use = models.CharField(max_length=10, blank=True, choices=AGE_FIRST_USE_SCALE)

    def __str__(self):
        return f"SectionC | Session {self.session_id}"


# ─── Section D — Cigarettes Electroniques (Vape) ──────────────────────────────

class SectionD(models.Model):
    session = models.OneToOneField(QuestionnaireSession, on_delete=models.CASCADE, related_name="section_d")

    access_difficulty = models.CharField(max_length=20, blank=True, choices=DIFFICULTY_ACCESS)
    family_vape = models.CharField(max_length=10, blank=True, choices=SOCIAL_CIRCLE)
    friends_vape = models.CharField(max_length=10, blank=True, choices=SOCIAL_CIRCLE)
    
    lifetime_freq = models.CharField(max_length=10, blank=True, choices=FREQUENCY_LIFETIME_12M)
    months_12_freq = models.CharField(max_length=10, blank=True, choices=FREQUENCY_LIFETIME_12M)
    days_30_freq = models.CharField(max_length=15, blank=True, choices=FREQUENCY_30DAYS_VAPE)
    
    age_first_use = models.CharField(max_length=10, blank=True, choices=AGE_FIRST_USE_SCALE)
    age_daily_use = models.CharField(max_length=10, blank=True, choices=AGE_FIRST_USE_SCALE)

    def __str__(self):
        return f"SectionD | Session {self.session_id}"


# ─── Section E — Narguilé (Chicha) ───────────────────────────────────────────

class SectionE(models.Model):
    session = models.OneToOneField(QuestionnaireSession, on_delete=models.CASCADE, related_name="section_e")

    access_difficulty = models.CharField(max_length=20, blank=True, choices=DIFFICULTY_ACCESS)
    family_hookah = models.CharField(max_length=10, blank=True, choices=SOCIAL_CIRCLE)
    friends_hookah = models.CharField(max_length=10, blank=True, choices=SOCIAL_CIRCLE)
    
    lifetime_freq = models.CharField(max_length=10, blank=True, choices=FREQUENCY_LIFETIME_12M)
    months_12_freq = models.CharField(max_length=10, blank=True, choices=FREQUENCY_LIFETIME_12M)
    days_30_freq = models.CharField(max_length=15, blank=True, choices=FREQUENCY_30DAYS_HOOKAH)
    
    age_first_use = models.CharField(max_length=10, blank=True, choices=AGE_FIRST_USE_SCALE)
    age_daily_use = models.CharField(max_length=10, blank=True, choices=AGE_FIRST_USE_SCALE)

    def __str__(self):
        return f"SectionE | Session {self.session_id}"


# ─── Section G — Boissons Alcoolisées ─────────────────────────────────────────

class SectionG(models.Model):
    session = models.OneToOneField(QuestionnaireSession, on_delete=models.CASCADE, related_name="section_g")

    access_difficulty = models.JSONField(default=dict, blank=True) # {beer, cocktails, wines, spirits, other}
    family_use = models.CharField(max_length=10, blank=True, choices=SOCIAL_CIRCLE)
    friends_use = models.CharField(max_length=10, blank=True, choices=SOCIAL_CIRCLE)
    
    lifetime_freq = models.CharField(max_length=10, blank=True, choices=FREQUENCY_LIFETIME_12M)
    months_12_freq = models.CharField(max_length=10, blank=True, choices=FREQUENCY_LIFETIME_12M)
    days_30_freq = models.CharField(max_length=10, blank=True, choices=FREQUENCY_LIFETIME_12M)
    
    days_30_by_type = models.JSONField(default=dict, blank=True) # {beer, cocktails, wines, spirits}
    
    binge_drinking_30days = models.CharField(max_length=10, blank=True, choices=[
        ("0", "Aucune fois"), ("1", "1"), ("2", "2"), ("3_5", "3-5"), ("6_9", "6-9"), ("10_plus", "≥ 10"),
    ])
    
    intoxication_lifetime = models.CharField(max_length=10, blank=True, choices=FREQUENCY_LIFETIME_12M)
    intoxication_12months = models.CharField(max_length=10, blank=True, choices=FREQUENCY_LIFETIME_12M)
    intoxication_30days = models.CharField(max_length=10, blank=True, choices=FREQUENCY_LIFETIME_12M)
    
    age_first_drink = models.CharField(max_length=10, blank=True, choices=AGE_FIRST_USE_SCALE)
    age_first_intoxication = models.CharField(max_length=10, blank=True, choices=AGE_FIRST_USE_SCALE)

    def __str__(self):
        return f"SectionG | Session {self.session_id}"


# ─── Section H — Tranquillisants / Sédatifs ──────────────────────────────────

class SectionH(models.Model):
    session = models.OneToOneField(QuestionnaireSession, on_delete=models.CASCADE, related_name="section_h")

    access_difficulty = models.CharField(max_length=15, blank=True, choices=DIFFICULTY_ACCESS)
    family_use = models.CharField(max_length=10, blank=True, choices=SOCIAL_CIRCLE)
    friends_use = models.CharField(max_length=10, blank=True, choices=SOCIAL_CIRCLE)
    
    lifetime_freq = models.CharField(max_length=10, blank=True, choices=FREQUENCY_LIFETIME_12M)
    months_12_freq = models.CharField(max_length=10, blank=True, choices=FREQUENCY_LIFETIME_12M)
    days_30_freq = models.CharField(max_length=10, blank=True, choices=FREQUENCY_LIFETIME_12M)
    
    age_first_use = models.CharField(max_length=10, blank=True, choices=AGE_FIRST_USE_SCALE)

    def __str__(self):
        return f"SectionH | Session {self.session_id}"


# ─── Section I — Cannabis (Zatla) ─────────────────────────────────────────────

class SectionI(models.Model):
    session = models.OneToOneField(QuestionnaireSession, on_delete=models.CASCADE, related_name="section_i")

    access_difficulty = models.CharField(max_length=15, blank=True, choices=DIFFICULTY_ACCESS)
    family_use = models.CharField(max_length=10, blank=True, choices=SOCIAL_CIRCLE)
    friends_use = models.CharField(max_length=10, blank=True, choices=SOCIAL_CIRCLE)
    
    lifetime_freq = models.CharField(max_length=10, blank=True, choices=FREQUENCY_LIFETIME_12M)
    months_12_freq = models.CharField(max_length=10, blank=True, choices=FREQUENCY_LIFETIME_12M)
    days_30_freq = models.CharField(max_length=10, blank=True, choices=FREQUENCY_LIFETIME_12M)
    
    age_first_use = models.CharField(max_length=10, blank=True, choices=AGE_FIRST_USE_SCALE)
    
    cannabis_types_12months = models.JSONField(default=dict, blank=True) # {resin, leaves}
    
    cannabis_problems_12months = models.JSONField(default=dict, blank=True) # {before_noon, alone, memory, family_advice, tried_stop, problems}

    def __str__(self):
        return f"SectionI | Session {self.session_id}"


class SectionJ(models.Model):
    session = models.OneToOneField(QuestionnaireSession, on_delete=models.CASCADE, related_name="section_j")

    access_difficulty = models.CharField(max_length=15, blank=True, choices=DIFFICULTY_ACCESS)
    family_use = models.CharField(max_length=10, blank=True, choices=SOCIAL_CIRCLE)
    friends_use = models.CharField(max_length=10, blank=True, choices=SOCIAL_CIRCLE)
    
    lifetime_freq = models.CharField(max_length=10, blank=True, choices=FREQUENCY_30DAYS_STANDARD)
    months_12_freq = models.CharField(max_length=10, blank=True, choices=FREQUENCY_30DAYS_STANDARD)
    days_30_freq = models.CharField(max_length=10, blank=True, choices=FREQUENCY_30DAYS_STANDARD)
    
    age_first_use = models.CharField(max_length=10, blank=True, choices=AGE_FIRST_USE_SCALE)

    def __str__(self):
        return f"SectionJ | Session {self.session_id}"


# ─── Section K — Ecstasy ─────────────────────────────────────────────────────

class SectionK(models.Model):
    session = models.OneToOneField(QuestionnaireSession, on_delete=models.CASCADE, related_name="section_k")

    access_difficulty = models.CharField(max_length=15, blank=True, choices=DIFFICULTY_ACCESS)
    family_use = models.CharField(max_length=10, blank=True, choices=SOCIAL_CIRCLE)
    friends_use = models.CharField(max_length=10, blank=True, choices=SOCIAL_CIRCLE)
    
    lifetime_freq = models.CharField(max_length=10, blank=True, choices=FREQUENCY_30DAYS_STANDARD)
    months_12_freq = models.CharField(max_length=10, blank=True, choices=FREQUENCY_30DAYS_STANDARD)
    days_30_freq = models.CharField(max_length=10, blank=True, choices=FREQUENCY_30DAYS_STANDARD)
    
    age_first_use = models.CharField(max_length=10, blank=True, choices=AGE_FIRST_USE_SCALE)

    def __str__(self):
        return f"SectionK | Session {self.session_id}"


# ─── Section L — Héroïne ─────────────────────────────────────────────────────

class SectionL(models.Model):
    session = models.OneToOneField(QuestionnaireSession, on_delete=models.CASCADE, related_name="section_l")

    access_difficulty = models.CharField(max_length=15, blank=True, choices=DIFFICULTY_ACCESS)
    family_use = models.CharField(max_length=10, blank=True, choices=SOCIAL_CIRCLE)
    friends_use = models.CharField(max_length=10, blank=True, choices=SOCIAL_CIRCLE)
    
    lifetime_freq = models.CharField(max_length=10, blank=True, choices=FREQUENCY_30DAYS_STANDARD)
    months_12_freq = models.CharField(max_length=10, blank=True, choices=FREQUENCY_30DAYS_STANDARD)
    days_30_freq = models.CharField(max_length=10, blank=True, choices=FREQUENCY_30DAYS_STANDARD)
    
    age_first_use = models.CharField(max_length=10, blank=True, choices=AGE_FIRST_USE_SCALE)

    def __str__(self):
        return f"SectionL | Session {self.session_id}"


# ─── Section M — Inhalants Narcotiques ──────────────────────────────────────────

class SectionM(models.Model):
    session = models.OneToOneField(QuestionnaireSession, on_delete=models.CASCADE, related_name="section_m")

    access_difficulty = models.CharField(max_length=15, blank=True, choices=DIFFICULTY_ACCESS)
    family_use = models.CharField(max_length=10, blank=True, choices=SOCIAL_CIRCLE)
    friends_use = models.CharField(max_length=10, blank=True, choices=SOCIAL_CIRCLE)
    
    lifetime_freq = models.CharField(max_length=10, blank=True, choices=FREQUENCY_30DAYS_STANDARD)
    months_12_freq = models.CharField(max_length=10, blank=True, choices=FREQUENCY_30DAYS_STANDARD)
    days_30_freq = models.CharField(max_length=10, blank=True, choices=FREQUENCY_30DAYS_STANDARD)
    
    age_first_use = models.CharField(max_length=10, blank=True, choices=AGE_FIRST_USE_SCALE)

    def __str__(self):
        return f"SectionM | Session {self.session_id}"


# ─── Section N — Nouvelles Substances Psychoactives ─────────────────────────────

class SectionN(models.Model):
    session = models.OneToOneField(QuestionnaireSession, on_delete=models.CASCADE, related_name="section_n")

    lifetime_freq = models.CharField(max_length=20, blank=True, choices=FREQUENCY_LIFETIME_12M)
    months_12_freq = models.CharField(max_length=20, blank=True, choices=FREQUENCY_LIFETIME_12M)
    days_30_freq = models.CharField(max_length=20, blank=True, choices=FREQUENCY_30DAYS_STANDARD)
    age_first_use = models.CharField(max_length=20, blank=True, choices=AGE_FIRST_USE_SCALE)
    
    forms = models.JSONField(default=dict, blank=True)
    synthetic_cannabinoids = models.CharField(max_length=10, blank=True, choices=YES_NO)
    synthetic_cathinones = models.CharField(max_length=10, blank=True, choices=YES_NO)

    def __str__(self):
        return f"SectionN | Session {self.session_id}"


# ─── Section P — Drogues de Synthese ────────────────────────────────────────────

class SectionP(models.Model):
    session = models.OneToOneField(QuestionnaireSession, on_delete=models.CASCADE, related_name="section_p")

    lifetime_freq = models.CharField(max_length=15, blank=True, choices=FREQUENCY_LIFETIME_12M)
    months_12_freq = models.CharField(max_length=15, blank=True, choices=FREQUENCY_LIFETIME_12M)
    days_30_freq = models.CharField(max_length=15, blank=True, choices=FREQUENCY_30DAYS_STANDARD)
    age_first_use = models.CharField(max_length=20, blank=True, choices=AGE_FIRST_USE_SCALE)
    substances = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return f"SectionP | Session {self.session_id}"


# ─── Section Q — Perception du Risque et Aide ────────────────────────────────────

class SectionQ(models.Model):
    session = models.OneToOneField(QuestionnaireSession, on_delete=models.CASCADE, related_name="section_q")

    # Table 83/84 grid
    risk_perceptions = models.JSONField(default=dict, blank=True)
    
    # Table 85 grid
    help_sources = models.JSONField(default=dict, blank=True)
    
    friend_use_risk = models.CharField(max_length=20, blank=True, choices=[
        ('definitely_no', 'Pas du tout'), ('probably_no', 'Probable non'), 
        ('probably_yes', 'Probable oui'), ('definitely_yes', 'Certainement')
    ])

    def __str__(self):
        return f"SectionQ | Session {self.session_id}"


# ─── Section R — Réseaux Sociaux ──────────────────────────────────────────────

class SectionR(models.Model):
    session = models.OneToOneField(QuestionnaireSession, on_delete=models.CASCADE, related_name="section_r")

    hours_per_day = models.CharField(max_length=15, blank=True, choices=FREQUENCY_DIGITAL_HOURS)
    agreement = models.JSONField(default=dict, blank=True) # {preoccupied, neglect, mood_bad}

    def __str__(self):
        return f"SectionR | Session {self.session_id}"


# ─── Section S — Jeux Vidéo ───────────────────────────────────────────────────

class SectionS(models.Model):
    session = models.OneToOneField(QuestionnaireSession, on_delete=models.CASCADE, related_name="section_s")

    hours_per_day = models.CharField(max_length=15, blank=True, choices=FREQUENCY_DIGITAL_HOURS)
    days_per_week = models.CharField(max_length=10, blank=True)
    agreement = models.JSONField(default=dict, blank=True) # {preoccupied, neglect}

    def __str__(self):
        return f"SectionS | Session {self.session_id}"


# ─── Section T — Jeux d'Argent ──────────────────────────────────────────────────

class SectionT(models.Model):
    session = models.OneToOneField(QuestionnaireSession, on_delete=models.CASCADE, related_name="section_t")

    months_12_freq = models.CharField(max_length=15, blank=True, choices=FREQUENCY_LIFETIME_12M)
    offline_games = models.JSONField(default=dict, blank=True) # Table 176
    online_games = models.JSONField(default=dict, blank=True) # Table 178
    
    felt_need_increase = models.CharField(max_length=10, blank=True, choices=YES_NO)
    lied_about_it = models.CharField(max_length=10, blank=True, choices=YES_NO)
    
    # Table 183
    gambling_problems = models.JSONField(default=dict, blank=True)

    def __str__(self):
        return f"SectionT | Session {self.session_id}"


# ─── Section U — Violence et Blessures ──────────────────────────────────────────

FIGHT_FREQUENCY = [
    ("0", "0 fois"), ("1", "1 fois"), ("2_3", "2-3 fois"),
    ("4_5", "4-5 fois"), ("6_7", "6-7 fois"), ("8_9", "8-9 fois"),
    ("10_11", "10-11 fois"), ("12_plus", "12 fois ou plus"),
]


class SectionU(models.Model):
    session = models.OneToOneField(QuestionnaireSession, on_delete=models.CASCADE, related_name="section_u")

    fights_12months = models.CharField(max_length=10, blank=True, choices=FIGHT_FREQUENCY)
    fight_circumstances = models.CharField(max_length=50, blank=True) # C.U02
    fight_location = models.CharField(max_length=50, blank=True) # C.U03
    staff_intervention = models.CharField(max_length=10, blank=True, choices=YES_NO) # C.U04
    fight_consequences = models.JSONField(default=list, blank=True) # Table U.05
    
    bullied = models.CharField(max_length=10, blank=True, choices=YES_NO)
    theft_victim = models.CharField(max_length=10, blank=True, choices=YES_NO)
    
    serious_injury_12months = models.CharField(max_length=25, blank=True, choices=[
        ("none", "Pas de blessure grave"),
        ("self_accidental", "Blessure accidentelle (moi-meme)"),
        ("other_accidental", "Blesse accidentellement par quelqu'un d'autre"),
        ("self_deliberate", "Blessure deliberee (moi-meme)"),
        ("other_deliberate", "Blesse deliberement par quelqu'un d'autre"),
    ])

    def __str__(self):
        return f"SectionU | Session {self.session_id}"


# ─── Section V — Santé Mentale (Stress Perçu) ───────────────────────────────────

class SectionV(models.Model):
    session = models.OneToOneField(QuestionnaireSession, on_delete=models.CASCADE, related_name="section_v")

    # PSS-4 Scale
    control = models.CharField(max_length=20, blank=True, choices=FREQUENCY_STRESS)
    confidence = models.CharField(max_length=20, blank=True, choices=FREQUENCY_STRESS)
    success = models.CharField(max_length=20, blank=True, choices=FREQUENCY_STRESS)
    difficulties = models.CharField(max_length=20, blank=True, choices=FREQUENCY_STRESS)

    def __str__(self):
        return f"SectionV | Session {self.session_id}"


# ─── Section Z — Validation de l'Honnêteté ──────────────────────────────────────

class SectionZ(models.Model):
    session = models.OneToOneField(QuestionnaireSession, on_delete=models.CASCADE, related_name="section_z")

    honesty_level = models.CharField(max_length=20, blank=True, choices=[
        ('completely', 'Tout à fait'), ('mostly', 'En grande partie'), ('partially', 'Partiellement'), ('not_at_all', 'Pas du tout')
    ])
    honesty_cannabis = models.CharField(max_length=20, blank=True, choices=[
        ('already_admitted', "J'ai déjà admis"), ('definitely_yes', 'Certainement oui'), 
        ('probably_yes', 'Probablement oui'), ('probably_no', 'Probablement non'), 
        ('definitely_no', 'Certainement non')
    ])

    def __str__(self):
        return f"SectionZ | Session {self.session_id}"
