import os
import sys
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Sentinelle.settings')
# ensure project root is importable
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import django, traceback
django.setup()

from rest_framework.test import APIRequestFactory, force_authenticate
from api.views import InviteUserView
from django.contrib.auth import get_user_model

User = get_user_model()

super_user = User.objects.filter(role='SUPER_ADMIN').first()
if not super_user:
    super_user = User.objects.create_user(username='superadmin', email='superadmin@example.com', password='password123', role='SUPER_ADMIN', is_active=True)
    print('Created super admin:', super_user.email)

factory = APIRequestFactory()
view = InviteUserView.as_view()

payload = {
    'email': 'lolitalollalolla@gmail.com',
    'username': 'lolita_test',
    'role': 'REGIONAL_ADMIN'
}

request = factory.post('/api/auth/invite/', payload, format='json')
force_authenticate(request, user=super_user)

try:
    response = view(request)
    print('Status code:', response.status_code)
    try:
        print('Data:', response.data)
    except Exception:
        print('Response content not JSON-accessible')
except Exception as e:
    traceback.print_exc()
    print('EXC:', str(e))
