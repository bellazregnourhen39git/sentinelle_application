import random
from django.core.management.base import BaseCommand
from django.utils import timezone
from api.models import (
    Governorate, SchoolEstablishment, SchoolClass, QuestionnaireSession,
    SectionA, SectionB, SectionC, SectionD, SectionE, SectionG, SectionH,
    SectionI, SectionJ, SectionK, SectionL, SectionM, SectionN, SectionP,
    SectionQ, SectionR, SectionS, SectionT, SectionU, SectionV, SectionZ,
    FREQUENCY_LIFETIME_12M, FREQUENCY_30DAYS_CIGS, FREQUENCY_30DAYS_VAPE,
    FREQUENCY_30DAYS_HOOKAH, FREQUENCY_30DAYS_STANDARD, FREQUENCY_ACTIVITIES,
    FREQUENCY_DIGITAL_HOURS, AGE_FIRST_USE_SCALE, DIFFICULTY_ACCESS,
    SATISFACTION_FIVE, YES_NO, SOCIAL_CIRCLE, FREQUENCY_STRESS,
    AGREEMENT_SCALE_SIMPLE, FIGHT_FREQUENCY
)

class Command(BaseCommand):
    help = 'Populate the database with fake data for visualization'

    def handle(self, *args, **kwargs):
        self.stdout.write("Populating database...")

        # 1. Governorates
        gov_names = ["Tunis", "Sfax", "Sousse", "Kairouan", "Bizerte"]
        governorates = []
        for name in gov_names:
            gov, created = Governorate.objects.get_or_create(name=name)
            governorates.append(gov)

        # 2. School Establishments
        establishments = []
        for gov in governorates:
            for i in range(1, 3):
                name = f"Lycée {gov.name} {i}"
                school, created = SchoolEstablishment.objects.get_or_create(name=name, governorate=gov)
                establishments.append(school)

        # 3. School Classes
        classes = []
        for school in establishments:
            for i in range(1, 4):
                name = f"Classe {i}"
                sclass, created = SchoolClass.objects.get_or_create(name=name, establishment=school)
                classes.append(sclass)

        # 4. Questionnaire Sessions
        for i in range(50):
            sclass = random.choice(classes)
            session = QuestionnaireSession.objects.create(
                school_class=sclass,
                school=sclass.establishment,
                governorate=sclass.establishment.governorate,
                language_used=random.choice(["FR", "AR"]),
                tobacco_user=random.choice([True, False]),
                ecig_user=random.choice([True, False]),
                hookah_user=random.choice([True, False]),
                alcohol_user=random.choice([True, False]),
                tranquilizer_user=random.choice([True, False]),
                cannabis_user=random.choice([True, False]),
                cocaine_user=random.choice([True, False]),
                ecstasy_user=random.choice([True, False]),
                heroin_user=random.choice([True, False]),
                inhalant_user=random.choice([True, False]),
                has_risk_behavior=random.choice([True, False])
            )

            # Section A
            SectionA.objects.create(
                session=session,
                gender=random.choice(["M", "F"]),
                birth_month=random.randint(1, 12),
                birth_year=random.randint(2008, 2012),
                activities_frequency={
                    "sports": random.choice([c[0] for c in FREQUENCY_ACTIVITIES]),
                    "reading": random.choice([c[0] for c in FREQUENCY_ACTIVITIES]),
                    "internet": random.choice([c[0] for c in FREQUENCY_ACTIVITIES]),
                },
                academic_performance=random.choice(["below_10", "10_12", "above_12"]),
                household_members=random.sample(["father", "mother", "siblings"], k=random.randint(1,3)),
                nights_out_30days=random.choice(["0", "1", "2", "3", "4", "5", "6", "7_plus"]),
                family_relationship_satisfaction={
                    "mother": random.choice([c[0] for c in SATISFACTION_FIVE]),
                    "father": random.choice([c[0] for c in SATISFACTION_FIVE]),
                }
            )

            # Section B
            SectionB.objects.create(
                session=session,
                father_education=random.choice([c[0] for c in SectionB.EDUCATION_LEVEL_COMPLEX]),
                mother_education=random.choice([c[0] for c in SectionB.EDUCATION_LEVEL_COMPLEX]),
                father_job=random.choice([c[0] for c in SectionB.EMPLOYMENT_STATUS]),
                mother_job=random.choice([c[0] for c in SectionB.EMPLOYMENT_STATUS]),
                economic_status=random.choice(["superior", "identical", "inferior"])
            )

            # Section C (Cigarettes)
            SectionC.objects.create(
                session=session,
                access_difficulty=random.choice([c[0] for c in DIFFICULTY_ACCESS]),
                lifetime_freq=random.choice([c[0] for c in FREQUENCY_LIFETIME_12M]),
                days_30_freq=random.choice([c[0] for c in FREQUENCY_30DAYS_CIGS]),
                age_first_use=random.choice([c[0] for c in AGE_FIRST_USE_SCALE])
            )

            # Section D (Vape)
            SectionD.objects.create(
                session=session,
                lifetime_freq=random.choice([c[0] for c in FREQUENCY_LIFETIME_12M]),
                days_30_freq=random.choice([c[0] for c in FREQUENCY_30DAYS_VAPE])
            )

            # Section G (Alcohol)
            SectionG.objects.create(
                session=session,
                lifetime_freq=random.choice([c[0] for c in FREQUENCY_LIFETIME_12M]),
                binge_drinking_30days=random.choice(["0", "1", "2", "3_5", "6_9", "10_plus"])
            )

            # Section I (Cannabis)
            SectionI.objects.create(
                session=session,
                lifetime_freq=random.choice([c[0] for c in FREQUENCY_LIFETIME_12M])
            )

            # Section R (Social Networks)
            SectionR.objects.create(
                session=session,
                hours_per_day=random.choice([c[0] for c in FREQUENCY_DIGITAL_HOURS])
            )
            
            # Section V (Stress)
            SectionV.objects.create(
                session=session,
                control=random.choice([c[0] for c in FREQUENCY_STRESS]),
                confidence=random.choice([c[0] for c in FREQUENCY_STRESS]),
                success=random.choice([c[0] for c in FREQUENCY_STRESS]),
                difficulties=random.choice([c[0] for c in FREQUENCY_STRESS]),
            )

            # Section Z (Honesty)
            SectionZ.objects.create(
                session=session,
                honesty_level=random.choice(['completely', 'mostly', 'partially', 'not_at_all'])
            )

        self.stdout.write(self.style.SUCCESS("Database populated successfully!"))
