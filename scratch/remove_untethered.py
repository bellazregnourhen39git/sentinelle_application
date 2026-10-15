import sys, os
sys.path.insert(0, r"c:\Users\MSI\sentinelle_application")
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'Sentinelle.settings')
import django
django.setup()

from api.models import QuestionnaireSession, ClassReport, SchoolEstablishment

# Check sessions to remove
untethered_sessions = QuestionnaireSession.objects.filter(class_report__created_by__isnull=True)
print("Untethered sessions to delete:", list(untethered_sessions.values('id', 'school__name', 'governorate__name')))

# Check class reports to remove
untethered_reports = ClassReport.objects.filter(created_by__isnull=True)
print("Untethered reports to delete:", list(untethered_reports.values('id', 'establishment_name', 'governorate__name')))

# Delete sessions first (which cascades to related Section models)
deleted_sessions_count = untethered_sessions.delete()
print("Deleted sessions:", deleted_sessions_count)

# Delete class reports
deleted_reports_count = untethered_reports.delete()
print("Deleted reports:", deleted_reports_count)

# Check dummy test school establishment
test_schools = SchoolEstablishment.objects.filter(name__icontains="Test Submission")
if test_schools.exists():
    print("Deleting test school establishment:", list(test_schools.values('id', 'name')))
    test_schools.delete()

print("\n--- Remaining Questionnaire Sessions ---")
for s in QuestionnaireSession.objects.all():
    print(f"Session {s.id}: valid={s.is_valid}, report_id={s.class_report_id}, creator={s.class_report.created_by if s.class_report else None} ({s.class_report.created_by.role if s.class_report and s.class_report.created_by else 'NONE'})")

print("\n--- Remaining Class Reports ---")
for cr in ClassReport.objects.all():
    print(f"Report {cr.id}: est='{cr.establishment_name}', gov={cr.governorate.name if cr.governorate else None}, creator={cr.created_by.username if cr.created_by else 'NONE'} ({cr.created_by.role if cr.created_by else 'NONE'})")
