import os
import sys
import random
import django

# Add current working directory to python path
sys.path.append(os.getcwd())

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Sentinelle.settings')
django.setup()

from api.models import (
    Governorate, SchoolEstablishment, SchoolClass, QuestionnaireSession,
    SectionA, SectionB, SectionC, SectionD, SectionE, SectionG, SectionH,
    SectionI, SectionJ, SectionK, SectionL, SectionM, SectionN, SectionP,
    SectionQ, SectionR, SectionS, SectionT, SectionU, SectionV, SectionZ
)

def seed_database():
    print("Clearing old questionnaire data...")
    QuestionnaireSession.objects.all().delete()
    print("Old data cleared successfully.")

    schools = SchoolEstablishment.objects.all()
    print(f"Found {schools.count()} schools to seed.")

    total_seeded = 0

    for school in schools:
        # Get or create a class for this school
        school_class, _ = SchoolClass.objects.get_or_create(
            name="3ème Sciences",
            establishment=school
        )
        
        gov = school.governorate
        
        # Decide some random rates for risk behaviors
        tobacco_rate = random.uniform(0.12, 0.25)
        cannabis_rate = random.uniform(0.04, 0.10)
        alcohol_rate = random.uniform(0.06, 0.15)
        ecig_rate = random.uniform(0.08, 0.18)
        hookah_rate = tobacco_rate * random.uniform(0.4, 0.7)

        # Seed 40 sessions per school
        n_sessions = 40
        
        def pick_freq(used, options):
            if not used:
                return '1'
            return random.choice([o for o in options if o != '1']) or '1'

        for i in range(n_sessions):
            is_tobacco  = random.random() < tobacco_rate
            is_cannabis = random.random() < cannabis_rate
            is_alcohol  = random.random() < alcohol_rate
            is_ecig     = random.random() < ecig_rate
            is_hookah   = random.random() < hookah_rate

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
                parents_absence_reason=random.choice(['1', '2', '3', '4', '']),
                activities_frequency={
                    'sports': random.choice(['1', '2', '3', '4', '5']),
                    'reading': random.choice(['1', '2', '3', '4', '5']),
                    'going_out': random.choice(['1', '2', '3', '4', '5']),
                    'internet': random.choice(['1', '2', '3', '4', '5'])
                },
                family_relationship_satisfaction={
                    'mother': random.choice(['1', '2', '3', '4', '5']),
                    'father': random.choice(['1', '2', '3', '4', '5'])
                }
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
            SectionH.objects.create(
                session=session, 
                access_difficulty='2', 
                social_circle={'family': random.choice(['1', '2', '3']), 'friends': random.choice(['1', '2', '3'])}, 
                lifetime_freq='1'
            )
            SectionJ.objects.create(
                session=session, 
                access_difficulty='1', 
                social_circle={'family': random.choice(['1', '2', '3']), 'friends': random.choice(['1', '2', '3'])}, 
                lifetime_freq='1'
            )
            SectionK.objects.create(
                session=session, 
                access_difficulty='1', 
                social_circle={'family': random.choice(['1', '2', '3']), 'friends': random.choice(['1', '2', '3'])}, 
                lifetime_freq='1'
            )
            SectionL.objects.create(
                session=session, 
                access_difficulty='1', 
                social_circle={'family': random.choice(['1', '2', '3']), 'friends': random.choice(['1', '2', '3'])}, 
                lifetime_freq='1'
            )
            SectionM.objects.create(
                session=session, 
                access_difficulty='1', 
                social_circle={'family': random.choice(['1', '2', '3']), 'friends': random.choice(['1', '2', '3'])}, 
                lifetime_freq='1'
            )
            SectionN.objects.create(
                session=session,
                lifetime_freq_by_type={'synthetic_cannabinoids': random.choice(['1', '2', '3'])},
                months_12_freq_by_type={'synthetic_cannabinoids': random.choice(['1', '2'])},
                age_first_use_by_type={'synthetic_cannabinoids': random.choice(['1', '2', '3', '4'])},
                synthetic_cannabinoids='2',
                synthetic_cathinones='2'
            )
            SectionP.objects.create(session=session, lifetime_freq='1')
            SectionQ.objects.create(
                session=session, 
                risk_perceptions={
                    'a': random.choice(['1', '2', '3', '4']), 
                    'b': random.choice(['1', '2', '3', '4']),
                    'c': random.choice(['1', '2', '3', '4'])
                }, 
                help_sources={'a': '1'}
            )
            SectionR.objects.create(
                session=session,
                hours_per_day_breakdown={
                    'social_networks': random.choice(['1', '2', '3', '4', '5', '6']),
                    'a': random.choice(['1', '2', '3', '4', '5', '6'])
                },
                agreement={'a': random.choice(['1', '2', '3'])}
            )
            SectionS.objects.create(
                session=session, 
                hours_per_day=random.choice(['3', '4', '5', '6']),
                agreement={'a': random.choice(['1', '2', '3'])}
            )
            SectionT.objects.create(session=session, months_12_freq='1')
            SectionU.objects.create(session=session, fights_12months='1')
            
            val_a = random.choice(['3', '4', '2'])
            val_d = random.choice(['3', '4'])
            SectionV.objects.create(
                session=session,
                a=val_a,
                b='4',
                c='4',
                d=val_d,
                stress_metrics={
                    'a': val_a,
                    'b': '4', 'c': '4',
                    'd': val_d
                }
            )
            SectionZ.objects.create(session=session, honesty_level='1')

        total_seeded += n_sessions
        print(f"  [OK] Seeded 40 sessions for {school.name} ({gov.name})")

    print(f"\nSuccessfully seeded {total_seeded} sessions across all {schools.count()} schools and 24 governorates!")

if __name__ == "__main__":
    seed_database()
