import sys, os
sys.path.insert(0, r"c:\Users\MSI\sentinelle_application")
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Sentinelle.settings')
import django
django.setup()

from api.models import User

for u in User.objects.all():
    print(f"User {u.id}: username='{u.username}', email='{u.email}', role='{u.role}', status='{u.status}', gov='{u.governorate}', school='{u.establishment}'")
