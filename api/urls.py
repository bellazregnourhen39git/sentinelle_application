from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .views import (
    RegisterView, ProfileView, QuestionnaireSubmitView,
    SchoolStatsView, GovernorateStatsView, NationalStatsView,
    SidraDataExportView, HomepageView, SectionStatsView
)

urlpatterns = [
    # Auth
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/profile/', ProfileView.as_view(), name='profile'),

    # Questionnaire
    path('questionnaire/submit/', QuestionnaireSubmitView.as_view(), name='questionnaire_submit'),

    # Dashboards
    path('stats/school/', SchoolStatsView.as_view(), name='stats_school'),
    path('stats/governorate/', GovernorateStatsView.as_view(), name='stats_governorate'),
    path('stats/national/', NationalStatsView.as_view(), name='stats_national'),

    # SIDRA Integration
    path('sidra/export/', SidraDataExportView.as_view(), name='sidra_export'),

    # Sentinelle Dashboards (New)
    path('homepage/', HomepageView.as_view(), name='homepage'),
    path('section-stats/<str:section_id>/', SectionStatsView.as_view(), name='section_stats'),
]
