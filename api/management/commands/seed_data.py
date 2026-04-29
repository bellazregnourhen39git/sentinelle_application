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
                        return '1'
                    return random.choice([o for o in options if o != '1']) or '1'

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
                        academic_performance=random.choice(['1', '2', '3']),
                        nights_out_30days=random.choice(['1', '2', '3', '4', '8']),
                        parents_absence_reason=random.choice(['1', '2', '3', '4', ''])
                    )
                    SectionB.objects.create(
                        session=session,
                        father_education=random.choice(['8', '7', '5', '3']),
                        mother_education=random.choice(['8', '7', '5', '3']),
                        father_job=random.choice(['1', '3', '4']),
                        mother_job=random.choice(['1', '3', '4']),
                        economic_status=random.choice(['1', '2', '3'])
                    )
                    SectionC.objects.create(
                        session=session,
                        access_difficulty=random.choice(['3', '2', '1', '4']),
                        social_circle={'family': random.choice(['1', '2', '3']), 'friends': random.choice(['1', '2', '3'])},
                        lifetime_freq=pick_freq(is_tobacco, ['1','2','3','4','5','6','7']),
                        days_30_freq=pick_freq(is_tobacco, ['1','2','3','4','5']),
                        age_first_use=pick_freq(is_tobacco, ['1','2','3','4','5','6','7'])
                    )
                    SectionD.objects.create(
                        session=session,
                        access_difficulty=random.choice(['3', '2', '1', '4']),
                        social_circle={'family': random.choice(['1', '2', '3']), 'friends': random.choice(['1', '2', '3'])},
                        lifetime_freq=pick_freq(is_ecig, ['1','2','3','4','5']),
                        days_30_freq=pick_freq(is_ecig, ['1','2','3','4']),
                        age_first_use=pick_freq(is_ecig, ['1','2','3','4','5','6','7'])
                    )
                    SectionE.objects.create(
                        session=session,
                        access_difficulty=random.choice(['3', '2', '1', '4']),
                        social_circle={'family': random.choice(['1', '2', '3']), 'friends': random.choice(['1', '2', '3'])},
                        lifetime_freq=pick_freq(is_hookah, ['1','2','3','4']),
                        days_30_freq='1' if not is_hookah else random.choice(['1','2','3','4']),
                        age_first_use=pick_freq(is_hookah, ['1','2','3','4','5','6','7'])
                    )
                    SectionG.objects.create(
                        session=session,
                        social_circle={'family': random.choice(['1', '2', '3']), 'friends': random.choice(['1', '2', '3'])},
                        lifetime_freq=pick_freq(is_alcohol, ['1','2','3']),
                        months_12_freq=pick_freq(is_alcohol, ['1','2']),
                        days_30_freq='1',
                        binge_drinking_30days=random.choice(['1', '2', '3']),
                        age_first_drink=pick_freq(is_alcohol, ['1','5','6','7'])
                    )
                    SectionI.objects.create(
                        session=session,
                        access_difficulty=random.choice(['3', '2', '1', '4']),
                        social_circle={'family': random.choice(['1', '2', '3']), 'friends': random.choice(['1', '2', '3'])},
                        lifetime_freq=pick_freq(is_cannabis, ['1','2','3']),
                        age_first_use=pick_freq(is_cannabis, ['1','6','7','8'])
                    )
                    SectionH.objects.create(session=session, access_difficulty='2', social_circle={'family': '2', 'friends': '2'}, lifetime_freq='1')
                    SectionJ.objects.create(session=session, access_difficulty='1', social_circle={'family': '2', 'friends': '2'}, lifetime_freq='1')
                    SectionK.objects.create(session=session, access_difficulty='1', social_circle={'family': '2', 'friends': '2'}, lifetime_freq='1')
                    SectionL.objects.create(session=session, access_difficulty='1', social_circle={'family': '2', 'friends': '2'}, lifetime_freq='1')
                    SectionM.objects.create(session=session, access_difficulty='1', social_circle={'family': '2', 'friends': '2'}, lifetime_freq='1')
                    SectionN.objects.create(session=session, lifetime_freq='1', synthetic_cannabinoids='2', synthetic_cathinones='2')
                    SectionP.objects.create(session=session, lifetime_freq='1')
                    SectionQ.objects.create(session=session, risk_perceptions={'a': random.choice(['1', '2', '3']), 'b': '1'}, help_sources={'a': '1'})
                    SectionR.objects.create(session=session, hours_per_day=random.choice(['3', '4', '5', '6']))
                    SectionS.objects.create(session=session, hours_per_day=random.choice(['3', '4', '5', '6']))
                    SectionT.objects.create(session=session, months_12_freq='1')
                    SectionU.objects.create(session=session, fights_12months='1')
                    SectionV.objects.create(session=session,
                        stress_metrics={
                            'a': random.choice(['3', '4', '2']),
                            'b': '4', 'c': '4',
                            'd': random.choice(['3', '4'])
                        }
                    )
                    SectionZ.objects.create(session=session, honesty_level='1')

                total_seeded += n_sessions
                self.stdout.write(f"  [OK] {gov_name}: {n_sessions} sessions seeded")

            self.stdout.write(self.style.SUCCESS(f"\nDone: Seeded {total_seeded} sessions across 24 governorates!"))
