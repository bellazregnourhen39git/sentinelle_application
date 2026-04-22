import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Sentinelle.settings')
django.setup()

from api.models import User
from django.contrib.auth import authenticate

def fix_user(email, password, username=None):
    u = User.objects.filter(email=email).first()
    if not u and username:
        u = User.objects.filter(username=username).first()
        
    if u:
        print(f"Repairing user: {u.email} (Role: {u.role})")
        u.set_password(password)
        u.is_active = True
        u.status = 'ACTIVE'
        u.approval_status = 'APPROVED'
        u.failed_attempts = 0
        u.save()
        
        # Verify
        valid = authenticate(email=u.email, password=password)
        print(f"Result: {u.email} updated. Authentication check? {'SUCCESS' if valid else 'FAILED'}")
    else:
        print(f"User {email} not found.")

if __name__ == "__main__":
    NEW_PASSWORD = 'Password123!'
    
    users_to_fix = [
        'superadmin_2@example.com',
        'aissaouinour80@gmail.com',
        'operator_test@example.com',
        'admin_3@example.com',
        'test_submit_user_1@example.com',
        'drhana@rabta.tn'
    ]
    
    for email in users_to_fix:
        fix_user(email, NEW_PASSWORD)
