from django.contrib import admin
from .models import (
    Governorate, SchoolEstablishment, SchoolClass, User,
    QuestionnaireSession,
    SectionA, SectionB, SectionC, SectionD, SectionE,
    SectionG, SectionH, SectionI, SectionJ, SectionK,
    SectionL, SectionM, SectionN, SectionP, SectionQ,
    SectionR, SectionS, SectionT, SectionU, SectionV, SectionZ,
)

admin.site.register(Governorate)
admin.site.register(SchoolEstablishment)
admin.site.register(SchoolClass)
admin.site.register(User)
admin.site.register(QuestionnaireSession)

# Section models
for model in [
    SectionA, SectionB, SectionC, SectionD, SectionE,
    SectionG, SectionH, SectionI, SectionJ, SectionK,
    SectionL, SectionM, SectionN, SectionP, SectionQ,
    SectionR, SectionS, SectionT, SectionU, SectionV, SectionZ,
]:
    admin.site.register(model)
