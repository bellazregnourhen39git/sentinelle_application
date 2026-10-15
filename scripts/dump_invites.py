import os
import sys
# ensure project root is on sys.path so `Sentinelle` settings package is importable
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Sentinelle.settings')
import django
django.setup()
from api.models import AuditLog, User

print('Recent Invite Audit logs:')
for a in AuditLog.objects.filter(action__startswith='INVITED_USER').order_by('-timestamp')[:20]:
    print(a.timestamp, a.user_id, a.action)

print('\nRecent pending users with invite tokens:')
for u in User.objects.filter(status='PENDING').order_by('-id')[:40]:
    print(u.id, u.email, u.invite_token, u.token_expiration, u.created_by_id)
