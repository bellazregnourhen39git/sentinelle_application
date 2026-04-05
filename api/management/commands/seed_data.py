import random
from django.core.management.base import BaseCommand
from django.db import transaction
from api.models import (
    Governorate, SchoolEstablishment, SchoolClass, QuestionnaireSession,
    SectionA, SectionB, SectionC, SectionD, SectionE, SectionG, SectionH,
    SectionI, SectionJ, SectionK, SectionL, SectionM, SectionN, SectionP,
    SectionQ, SectionR, SectionS, SectionT, SectionU, SectionV, SectionZ
)

# All 24 Tunisia governorates with realistic epidemiological profiles
# Format: (name, n_sessions, tobacco_rate, cannabis_rate, alcohol_rate, ecig_rate)
GOVERNORATE_PROFILES = [
    ("Tunis",        120, 0.22, 0.09, 0.14, 0.18),
    ("Ariana",       90,  0.18, 0.07, 0.11, 0.15),
    ("Ben Arous",    85,  0.17, 0.06, 0.10, 0.14),
    ("Mannouba",     70,  0.15, 0.05, 0.09, 0.13),
    ("Nabeul",       95,  0.20, 0.08, 0.13, 0.16),
    ("Zaghouan",     45,  0.14, 0.04, 0.07, 0.10),
    ("Bizerte",      80,  0.19, 0.07, 0.12, 0.14),
    ("Beja",         55,  0.16, 0.05, 0.08, 0.11),
    ("Jandouba",     60,  0.17, 0.06, 0.09, 0.12),
    ("Le kef",       50,  0.15, 0.05, 0.08, 0.10),
    ("Siliana",      40,  0.13, 0.04, 0.07, 0.09),
    ("Sousse",       100, 0.21, 0.08, 0.13, 0.17),
    ("Monastir",     75,  0.18, 0.07, 0.11, 0.15),
    ("Mahdia",       60,  0.16, 0.06, 0.09, 0.12),
    ("Sfax",         110, 0.20, 0.08, 0.12, 0.16),
    ("Kairouan",     65,  0.16, 0.05, 0.09, 0.11),
    ("Kasserine",    55,  0.17, 0.06, 0.10, 0.12),
    ("Sidi Bouzid",  50,  0.15, 0.05, 0.08, 0.10),
    ("Gabes",        70,  0.18, 0.07, 0.11, 0.13),
    ("Mednine",      65,  0.17, 0.06, 0.10, 0.12),
    ("Tataouine",    35,  0.12, 0.04, 0.06, 0.09),
    ("Gafsa",        60,  0.19, 0.08, 0.12, 0.14),
    ("Tozeur",       30,  0.13, 0.04, 0.07, 0.09),
    ("Kebili",       35,  0.14, 0.04, 0.07, 0.10),
]


class Command(BaseCommand):
    help = 'Seeds the database with realistic MedSPAD questionnaire data for all 24 governorates'

    def handle(self, *args, **kwargs):
        self.stdout.write("Seeding data for all 24 governorates...")

        with transaction.atomic():
            total_seeded = 0

            for (gov_name, n_sessions, tobacco_rate, cannabis_rate, alcohol_rate, ecig_rate) in GOVERNORATE_PROFILES:

                gov, _ = Governorate.objects.get_or_create(name=gov_name)
                school, _ = SchoolEstablishment.objects.get_or_create(
                    name=f"Lycée de {gov_name}",
                    governorate=gov
                )
                school_class, _ = SchoolClass.objects.get_or_create(
                    name="3ème Sciences",
                    establishment=school
                )

                def pick_freq(used, options):
                    if not used:
                        return 'never'
                    return random.choice([o for o in options if o != 'never']) or 'never'

                for i in range(n_sessions):
                    is_tobacco  = random.random() < tobacco_rate
                    is_cannabis = random.random() < cannabis_rate
                    is_alcohol  = random.random() < alcohol_rate
                    is_ecig     = random.random() < ecig_rate
                    is_hookah   = random.random() < (tobacco_rate * 0.6)

                    session = QuestionnaireSession.objects.create(
                        school_class=school_class,
                        school=school,
                        governorate=gov,
                        tobacco_user=is_tobacco,
                        cannabis_user=is_cannabis,
                        alcohol_user=is_alcohol,
                        ecig_user=is_ecig,
                        hookah_user=is_hookah,
                        has_risk_behavior=any([is_tobacco, is_cannabis, is_alcohol, is_ecig, is_hookah])
                    )

                    SectionA.objects.create(
                        session=session,
                        gender=random.choice(['M', 'F']),
                        academic_performance=random.choice(['below_10', '10_12', 'above_12']),
                        nights_out_30days=random.choice(['0', '1', '2', '3', '7_plus']),
                        parents_absence_reason=random.choice(['death', 'divorce', 'migration', 'other', ''])
                    )
                    SectionB.objects.create(
                        session=session,
                        father_education=random.choice(['university', 'secondary_bac', 'college_9th', 'primary_6th']),
                        mother_education=random.choice(['university', 'secondary_bac', 'college_9th', 'primary_6th']),
                        father_job=random.choice(['full_time', 'unemployed', 'retired']),
                        mother_job=random.choice(['full_time', 'unemployed', 'retired']),
                        economic_status=random.choice(['superior', 'identical', 'inferior'])
                    )
                    SectionC.objects.create(
                        session=session,
                        access_difficulty=random.choice(['easy', 'difficult', 'impossible', 'dont_know']),
                        family_smoke=random.choice(['yes', 'no', 'dont_know']),
                        friends_smoke=random.choice(['yes', 'no', 'dont_know']),
                        lifetime_freq=pick_freq(is_tobacco, ['never','1_2','3_5','6_9','10_19','20_39','40_plus']),
                        days_30_freq=pick_freq(is_tobacco, ['never','lt1_week','lt1_day','1_5_day','6_10_day']),
                        age_first_use=pick_freq(is_tobacco, ['never','le9','10','11','12','13','14'])
                    )
                    SectionD.objects.create(
                        session=session,
                        access_difficulty=random.choice(['easy', 'difficult', 'impossible', 'dont_know']),
                        family_vape=random.choice(['yes', 'no', 'dont_know']),
                        friends_vape=random.choice(['yes', 'no', 'dont_know']),
                        lifetime_freq=pick_freq(is_ecig, ['never','1_2','3_5','6_9','10_19']),
                        days_30_freq=pick_freq(is_ecig, ['never','lt1_week','ge1_week','daily']),
                        age_first_use=pick_freq(is_ecig, ['never','le9','10','11','12','13','14'])
                    )
                    SectionE.objects.create(
                        session=session,
                        access_difficulty=random.choice(['easy', 'difficult', 'impossible', 'dont_know']),
                        family_hookah=random.choice(['yes', 'no', 'dont_know']),
                        friends_hookah=random.choice(['yes', 'no', 'dont_know']),
                        lifetime_freq=pick_freq(is_hookah, ['never','1_2','3_5','6_9']),
                        days_30_freq='never' if not is_hookah else random.choice(['never','lt1_week','lt1_day','1_5_day']),
                        age_first_use=pick_freq(is_hookah, ['never','le9','10','11','12','13','14'])
                    )
                    SectionG.objects.create(
                        session=session,
                        family_use=random.choice(['yes', 'no', 'dont_know']),
                        friends_use=random.choice(['yes', 'no', 'dont_know']),
                        lifetime_freq=pick_freq(is_alcohol, ['never','1_2','3_5']),
                        months_12_freq=pick_freq(is_alcohol, ['never','1_2']),
                        days_30_freq='never',
                        binge_drinking_30days=random.choice(['0', '1', '2']),
                        age_first_drink=pick_freq(is_alcohol, ['never','12','13','14'])
                    )
                    SectionI.objects.create(
                        session=session,
                        access_difficulty=random.choice(['easy', 'difficult', 'impossible', 'dont_know']),
                        family_use=random.choice(['yes', 'no', 'dont_know']),
                        friends_use=random.choice(['yes', 'no', 'dont_know']),
                        lifetime_freq=pick_freq(is_cannabis, ['never','1_2','3_5']),
                        age_first_use=pick_freq(is_cannabis, ['never','13','14','15'])
                    )
                    SectionH.objects.create(session=session, access_difficulty='difficult', family_use='no', friends_use='no', lifetime_freq='never')
                    SectionJ.objects.create(session=session, access_difficulty='impossible', family_use='no', friends_use='no', lifetime_freq='never')
                    SectionK.objects.create(session=session, access_difficulty='impossible', family_use='no', friends_use='no', lifetime_freq='never')
                    SectionL.objects.create(session=session, access_difficulty='impossible', family_use='no', friends_use='no', lifetime_freq='never')
                    SectionM.objects.create(session=session, access_difficulty='impossible', family_use='no', friends_use='no', lifetime_freq='never')
                    SectionN.objects.create(session=session, lifetime_freq='never', synthetic_cannabinoids='no', synthetic_cathinones='no')
                    SectionP.objects.create(session=session, lifetime_freq='never')
                    SectionQ.objects.create(session=session, friend_use_risk=random.choice(['definitely_no', 'probably_no', 'probably_yes']))
                    SectionR.objects.create(session=session, hours_per_day=random.choice(['1h', '2_3h', '4_5h', '6h_plus']))
                    SectionS.objects.create(session=session, hours_per_day=random.choice(['1h', '2_3h', '4_5h', '6h_plus']))
                    SectionT.objects.create(session=session, months_12_freq='never', felt_need_increase='no', lied_about_it='no')
                    SectionU.objects.create(session=session, fights_12months='0', staff_intervention='no', serious_injury_12months='none')
                    SectionV.objects.create(session=session,
                        control=random.choice(['sometimes', 'fairly_often', 'almost_never']),
                        confidence='fairly_often', success='fairly_often',
                        difficulties=random.choice(['sometimes', 'fairly_often'])
                    )
                    SectionZ.objects.create(session=session, honesty_level='completely', honesty_cannabis='definitely_yes')

                total_seeded += n_sessions
                self.stdout.write(f"  ✓ {gov_name}: {n_sessions} sessions seeded")

            self.stdout.write(self.style.SUCCESS(f"\n✅ Seeded {total_seeded} sessions across 24 governorates!"))
