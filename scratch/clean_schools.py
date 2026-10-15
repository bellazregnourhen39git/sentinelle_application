import os
import sys
sys.path.insert(0, os.path.abspath('.'))
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Sentinelle.settings')
django.setup()

from api.models import SchoolEstablishment, ClassReport, QuestionnaireSession, User, SchoolClass

print('=== CURRENT STATE ===')
print('Total SchoolEstablishments:', SchoolEstablishment.objects.count())
print('Total ClassReports:', ClassReport.objects.count())

# Find establishments referenced by ClassReport, User, QuestionnaireSession, or SchoolClass with sessions
used_school_ids = set()

for cr in ClassReport.objects.all():
    if cr.establishment_id:
        used_school_ids.add(cr.establishment_id)

for u in User.objects.filter(establishment__isnull=False):
    used_school_ids.add(u.establishment_id)

for qs in QuestionnaireSession.objects.filter(school__isnull=False):
    used_school_ids.add(qs.school_id)

print(f'Used School IDs: {used_school_ids}')
for sid in used_school_ids:
    sch = SchoolEstablishment.objects.filter(id=sid).first()
    if sch:
        print(f'  Preserved School: ID={sch.id}, Name={sch.name}, Gov={sch.governorate}')

# Find unused schools to delete
unused_schools = SchoolEstablishment.objects.exclude(id__in=used_school_ids)
print(f'Unused seeded schools to remove: {unused_schools.count()}')
for sch in unused_schools:
    print(f'  Deleting ID={sch.id}, Name={sch.name}')

# Delete unused school classes first if any
SchoolClass.objects.filter(establishment__in=unused_schools).delete()
deleted_count, _ = unused_schools.delete()
print(f'Deleted {deleted_count} unused records.')
print('Remaining SchoolEstablishments:', SchoolEstablishment.objects.count())
