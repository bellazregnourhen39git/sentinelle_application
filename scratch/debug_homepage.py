import os
import sys

sys.stdout.reconfigure(encoding='utf-8')
sys.path.insert(0, os.path.abspath('.'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Sentinelle.settings')

import django
django.setup()

from rest_framework.test import APIClient
from django.contrib.auth import get_user_model

User = get_user_model()

client = APIClient()

# Test 1: Unauthenticated homepage request
print("=== TEST 1: Unauthenticated ===")
res1 = client.get('/api/homepage/')
print("Status:", res1.status_code)
if res1.status_code != 200:
    print("Error:", res1.data)

# Test 2: Authenticated as super admin
print("\n=== TEST 2: Super Admin ===")
superadmin = User.objects.filter(role='SUPER_ADMIN').first()
if superadmin:
    client.force_authenticate(user=superadmin)
    res2 = client.get('/api/homepage/')
    print("Status:", res2.status_code)
    if res2.status_code != 200:
        print("Error:", res2.data)

# Test 3: Authenticated as practitioner
print("\n=== TEST 3: Practitioner ===")
practitioner = User.objects.filter(role='PRACTITIONER').first()
if practitioner:
    client.force_authenticate(user=practitioner)
    res3 = client.get('/api/homepage/')
    print("Status:", res3.status_code)
    if res3.status_code != 200:
        print("Error:", res3.data)

# Test 4: Section stats
print("\n=== TEST 4: Section stats C ===")
res4 = client.get('/api/section-stats/C/')
print("Status:", res4.status_code)
if res4.status_code != 200:
    print("Error:", res4.data)
