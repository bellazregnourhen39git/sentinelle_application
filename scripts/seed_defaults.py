import os
import sys
import django

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Sentinelle.settings')
django.setup()

from api.models import User, Governorate, SchoolEstablishment


def seed():
    # Super Admin
    u, _ = User.objects.get_or_create(
        email='msi@sentinelle.tn',
        defaults={'username': 'msi', 'role': 'SUPER_ADMIN', 'status': 'ACTIVE', 'is_active': True}
    )
    u.set_password('msi')
    u.role = 'SUPER_ADMIN'
    u.status = 'ACTIVE'
    u.is_active = True
    u.save()

    # Practitioner with school
    gov, _ = Governorate.objects.get_or_create(name='Sfax')
    sch, _ = SchoolEstablishment.objects.get_or_create(name='Lycée Habib Thameur', governorate=gov)
    u2, _ = User.objects.get_or_create(
        email='medbouzid1234567@gmail.com',
        defaults={'username': 'medbouzid1234567', 'role': 'PRACTITIONER', 'status': 'ACTIVE', 'is_active': True}
    )
    u2.set_password('lolalola')
    u2.governorate = gov
    u2.establishment = sch
    u2.save()

    print(f'Seed complete: {u.email} ({u.role}), {u2.email} ({u2.role})')


if __name__ == '__main__':
    seed()
