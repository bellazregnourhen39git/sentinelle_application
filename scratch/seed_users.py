import os
import sys
import django

# Add current working directory to python path
sys.path.append(os.getcwd())

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Sentinelle.settings')
django.setup()

from api.models import User, Governorate, SchoolEstablishment

def seed_user(email, username, password, role, gov_name=None, school_name=None):
    u = User.objects.filter(email=email).first()
    if not u:
        u = User.objects.filter(username=username).first()
        
    gov = None
    if gov_name:
        gov = Governorate.objects.filter(name=gov_name).first()
        if not gov:
            gov = Governorate.objects.create(name=gov_name)
            
    school = None
    if school_name and gov:
        school = SchoolEstablishment.objects.filter(name=school_name, governorate=gov).first()
        if not school:
            school = SchoolEstablishment.objects.create(name=school_name, governorate=gov)
            
    if not u:
        print(f"Creating user: {email} ({role})")
        u = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            role=role,
            status='ACTIVE',
            is_active=True
        )
    else:
        print(f"User {email} already exists. Updating role/status/password...")
        u.role = role
        u.status = 'ACTIVE'
        u.is_active = True
        u.set_password(password)
        
    if gov:
        u.governorate = gov
    if school:
        u.establishment = school
        
    u.failed_attempts = 0
    u.save()
    print(f"  [OK] User {u.email} is ready. Role: {u.role}, Gov: {u.governorate}, School: {u.establishment}")

# Seed all 5 profile roles
seed_user('msi@sentinelle.tn', 'msi', 'msi', 'SUPER_ADMIN')
seed_user('globaladmin@sentinelle.tn', 'globaladmin', 'Password123!', 'GLOBAL_ADMIN')
seed_user('analyst_tunis@sentinelle.tn', 'analyst_tunis', 'Password123!', 'REGIONAL_ANALYST', gov_name='Tunis')
seed_user('operator@sentinelle.tn', 'operator', 'Password123!', 'OPERATOR')
seed_user('medbouzid1234567@gmail.com', 'medbouzid1234567', 'lolalola', 'PRACTITIONER', gov_name='Sfax', school_name='Lycée Habib Thameur')
seed_user('practitioner_tunis@sentinelle.tn', 'practitioner_tunis', 'Password123!', 'PRACTITIONER', gov_name='Tunis', school_name='Lycée Tunis 1')

print("\nDatabase successfully seeded with all user profiles!")
