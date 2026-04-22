from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import (
    SchoolStatsView, GovernorateStatsView, NationalStatsView,
    SidraDataExportView, HomepageView, SectionStatsView, LabStatsView,
    RegisterView, ProfileView, QuestionnaireSubmitView, QuestionnaireExportView,
    InviteUserView, ActivateUserView, SecureTokenObtainPairView,
    PendingApprovalsView, ApproveUserView, RejectUserView,
    UserListView, UserExportCSVView, UserDeleteView,
    PlatformTerminologyView, PlatformTerminologyUpdateView,
    GovernorateListView, SchoolEstablishmentListView,
    InsightsView, RawDataExportView,
    DynamicQuestionListView, DynamicQuestionDetailView
)


urlpatterns = [
    # Auth
    path('auth/invite/', InviteUserView.as_view(), name='invite_user'),
    path('auth/activate/', ActivateUserView.as_view(), name='activate_user'),
    path('auth/login/', SecureTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/profile/', ProfileView.as_view(), name='profile'),
    path('auth/pending-approvals/', PendingApprovalsView.as_view(), name='pending_approvals'),
    path('auth/approve-user/<int:user_id>/', ApproveUserView.as_view(), name='approve_user'),
    path('auth/reject-user/<int:user_id>/', RejectUserView.as_view(), name='reject_user'),
    path('auth/users/', UserListView.as_view(), name='user_list'),
    path('auth/users/export/', UserExportCSVView.as_view(), name='user_export'),
    path('auth/delete-user/<int:pk>/', UserDeleteView.as_view(), name='delete_user'),
    path('terminology/', PlatformTerminologyView.as_view(), name='terminology_list'),
    path('terminology/<str:key>/', PlatformTerminologyUpdateView.as_view(), name='terminology_update'),
    path('geography/governorates/', GovernorateListView.as_view(), name='list_governorates'),
    path('geography/establishments/', SchoolEstablishmentListView.as_view(), name='list_establishments'),

    # Questionnaire
    path('questionnaire/submit/', QuestionnaireSubmitView.as_view(), name='questionnaire_submit'),
    path('questionnaire/export/', QuestionnaireExportView.as_view(), name='questionnaire_export'),

    # Dashboards
    path('stats/school/', SchoolStatsView.as_view(), name='stats_school'),
    path('stats/governorate/', GovernorateStatsView.as_view(), name='stats_governorate'),
    path('stats/national/', NationalStatsView.as_view(), name='stats_national'),
    path('stats/insights/', InsightsView.as_view(), name='stats_insights'),
    path('stats/export-raw/', RawDataExportView.as_view(), name='export_raw_data'),

    # SIDRA Integration
    path('sidra/export/', SidraDataExportView.as_view(), name='sidra_export'),

    # Sentinelle Dashboards (New)
    path('homepage/', HomepageView.as_view(), name='homepage'),
    path('section-stats/<str:section_id>/', SectionStatsView.as_view(), name='section_stats'),
    path('lab-stats/', LabStatsView.as_view(), name='lab_stats'),

    # Dynamic Questions
    path('dynamic-questions/', DynamicQuestionListView.as_view(), name='dynamic_questions_list'),
    path('dynamic-questions/<str:code>/', DynamicQuestionDetailView.as_view(), name='dynamic_question_detail'),
]
