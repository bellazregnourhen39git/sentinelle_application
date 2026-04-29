from api.models import QuestionnaireSession
sessions = QuestionnaireSession.objects.filter(school__isnull=True, class_report__isnull=False)
count = 0
for s in sessions:
    if s.class_report:
        s.school = s.class_report.establishment
        s.governorate = s.class_report.governorate
        s.save()
        count += 1
print(f"Updated {count} sessions.")
