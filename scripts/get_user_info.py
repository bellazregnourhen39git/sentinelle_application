import os
import sys
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Sentinelle.settings')
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
import django
django.setup()
from django.contrib.auth import get_user_model
from django.utils import timezone

User = get_user_model()

def print_user(email):
    u = User.objects.filter(email=email).first()
    if not u:
        print('User not found:', email)
        return
    print('id:', u.id)
    print('email:', u.email)
    print('username:', u.username)
    print('role:', u.role)
    print('status:', u.status)
    print('is_active:', u.is_active)
    print('invite_token:', u.invite_token)
    print('token_expiration:', u.token_expiration)
    if u.token_expiration:
        print('token expired?', u.token_expiration < timezone.now())

if __name__ == '__main__':
    import sys
    email = sys.argv[1] if len(sys.argv) > 1 else 'salma.mohamed.students@gmail.com'
    print_user(email)
