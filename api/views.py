from rest_framework import generics, permissions, status, views
from rest_framework.response import Response
from django.db.models import Count, Q, Avg
from django.contrib.auth import get_user_model
from django.db import models
from .models import Governorate, SchoolEstablishment, SchoolClass, QuestionnaireSession, SectionV
from .analytics import SentinelleAnalytics
from .serializers import (
    RegisterSerializer, UserSerializer, GovernorateSerializer,
    SchoolEstablishmentSerializer, SchoolClassSerializer,
    QuestionnaireSessionSerializer,
)

User = get_user_model()


# ─── Auth Views ──────────────────────────────────────────────────────────────────

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer


class ProfileView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user


# ─── Questionnaire Submission ─────────────────────────────────────────────────────

class QuestionnaireSubmitView(generics.CreateAPIView):
    """
    Accepts a full nested JSON payload (session + all section sub-objects).
    Creates QuestionnaireSession and all provided section records atomically.
    """
    serializer_class = QuestionnaireSessionSerializer
    permission_classes = (permissions.AllowAny,)

    def create(self, request, *args, **kwargs):
        # Default mock school class for testing without auth
        data = request.data.copy()
        if not data.get('school_class'):
            from .models import SchoolClass
            sc = SchoolClass.objects.first()
            if sc:
                data['school_class'] = sc.id

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        session = serializer.save()
        return Response(
            QuestionnaireSessionSerializer(session).data,
            status=status.HTTP_201_CREATED,
        )


# ─── Dashboard Stats ──────────────────────────────────────────────────────────────

class SchoolStatsView(views.APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        user = request.user
        if user.role != 'USER' or not user.establishment:
            return Response({"detail": "Not authorized or missing establishment."}, status=403)

        sessions = QuestionnaireSession.objects.filter(school=user.establishment)
        total = sessions.count()
        stats = {
            "total_responses": total,
            "tobacco_users": sessions.filter(tobacco_user=True).count(),
            "ecig_users": sessions.filter(ecig_user=True).count(),
            "hookah_users": sessions.filter(hookah_user=True).count(),
            "alcohol_users": sessions.filter(alcohol_user=True).count(),
            "tranquilizer_users": sessions.filter(tranquilizer_user=True).count(),
            "cannabis_users": sessions.filter(cannabis_user=True).count(),
            "cocaine_users": sessions.filter(cocaine_user=True).count(),
            "ecstasy_users": sessions.filter(ecstasy_user=True).count(),
            "heroin_users": sessions.filter(heroin_user=True).count(),
            "inhalant_users": sessions.filter(inhalant_user=True).count(),
            "has_risk_behavior": sessions.filter(has_risk_behavior=True).count(),
        }
        return Response(stats)


class GovernorateStatsView(views.APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        user = request.user
        if user.role not in ['ADMIN', 'SUPERADMIN']:
            return Response({"detail": "Not authorized."}, status=403)

        gov_id = user.governorate.id if user.role == 'ADMIN' else request.query_params.get('governorate_id')
        if not gov_id:
            return Response({"detail": "Governorate not specified."}, status=400)

        sessions = QuestionnaireSession.objects.filter(governorate_id=gov_id)
        by_school = sessions.values('school__name').annotate(
            total=Count('id'),
            tobacco=Count('id', filter=Q(tobacco_user=True)),
            alcohol=Count('id', filter=Q(alcohol_user=True)),
            cannabis=Count('id', filter=Q(cannabis_user=True)),
            cocaine=Count('id', filter=Q(cocaine_user=True)),
        )
        stats = {
            "total_responses": sessions.count(),
            "by_school": list(by_school),
        }
        return Response(stats)


class NationalStatsView(views.APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        user = request.user
        if user.role != 'SUPERADMIN':
            return Response({"detail": "Not authorized."}, status=403)

        sessions = QuestionnaireSession.objects.all()
        by_gov = sessions.values('governorate__name').annotate(
            total=Count('id'),
            tobacco=Count('id', filter=Q(tobacco_user=True)),
            alcohol=Count('id', filter=Q(alcohol_user=True)),
            cannabis=Count('id', filter=Q(cannabis_user=True)),
            cocaine=Count('id', filter=Q(cocaine_user=True)),
            ecstasy=Count('id', filter=Q(ecstasy_user=True)),
            heroin=Count('id', filter=Q(heroin_user=True)),
        )
        stats = {
            "total_national_responses": sessions.count(),
            "by_governorate": list(by_gov),
        }
        return Response(stats)


# ─── Homepage Aggregates ───────────────────────────────────────────────────────

class HomepageView(views.APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request):
        user = request.user
        scope_type = request.query_params.get('scope_type', 'national')
        scope_id = request.query_params.get('scope_id')

        # 1. Scope Permission & Filtering
        sessions = QuestionnaireSession.objects.all()
        scope_label = "Vue nationale"

        if scope_type == 'user_school':
            if not user.is_authenticated or not user.establishment:
                return Response({"detail": "User has no establishment or not logged in."}, status=403)
            sessions = sessions.filter(school=user.establishment)
            scope_label = f"Lycée {user.establishment.name}"
        elif scope_type == 'gouvernorate':
            if not user.is_authenticated:
                return Response({"detail": "Unauthorized scope access."}, status=403)
            if user.role == 'ADMIN':
                gov = user.governorate
            elif user.role == 'SUPERADMIN' and scope_id:
                gov = Governorate.objects.get(id=scope_id)
            else:
                return Response({"detail": "Unauthorized scope access."}, status=403)
            sessions = sessions.filter(governorate=gov)
            scope_label = f"Gouvernorat de {gov.name}"
        elif scope_type == 'school':
            if not user.is_authenticated or user.role != 'SUPERADMIN' or not scope_id:
                return Response({"detail": "Unauthorized scope access."}, status=403)
            school = SchoolEstablishment.objects.get(id=scope_id)
            sessions = sessions.filter(school=school)
            scope_label = f"Lycée {school.name}"
        if scope_type == 'national':
            # Everyone sees national
            pass
        
        data = SentinelleAnalytics.get_homepage_stats(sessions, scope_label)
        if not data:
             return Response({"headline": {"scope_label": scope_label, "n_submissions": 0}, "kpis": [], "group_prevalence": [], "top_sections": []})

        return Response(data)


# ─── SIDRA Integration ────────────────────────────────────────────────────────────

class SidraDataExportView(views.APIView):
    """
    Endpoint for the external SIDRA platform to retrieve aggregated national statistics.
    Restricted to SUPERADMIN only.
    """
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        if request.user.role != 'SUPERADMIN':
            return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)

        sessions = QuestionnaireSession.objects.all()
        data = {
            "survey_source": "MedSPAD_Sentinelle",
            "total_entries": sessions.count(),
            "prevalence_indicators": {
                "tobacco": sessions.filter(tobacco_user=True).count(),
                "e_cigarette": sessions.filter(ecig_user=True).count(),
                "hookah": sessions.filter(hookah_user=True).count(),
                "alcohol": sessions.filter(alcohol_user=True).count(),
                "tranquilizers": sessions.filter(tranquilizer_user=True).count(),
                "cannabis": sessions.filter(cannabis_user=True).count(),
                "cocaine": sessions.filter(cocaine_user=True).count(),
                "ecstasy": sessions.filter(ecstasy_user=True).count(),
                "heroin": sessions.filter(heroin_user=True).count(),
                "inhalants": sessions.filter(inhalant_user=True).count(),
            }
        }
        return Response(data)


class SectionStatsView(views.APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request, section_id):
        user = request.user
        scope_type = request.query_params.get('scope_type', 'national')
        scope_id = request.query_params.get('scope_id')

        # 1. Scope Filtering
        sessions = QuestionnaireSession.objects.all()
        national_sessions = QuestionnaireSession.objects.all()

        if scope_type == 'user_school':
            if not user.is_authenticated:
                return Response({"detail": "Not logged in."}, status=403)
            sessions = sessions.filter(school=user.establishment)
        elif scope_type == 'gouvernorate':
            if not user.is_authenticated:
                return Response({"detail": "Not logged in."}, status=403)
            gov_id = user.governorate.id if user.role == 'ADMIN' else scope_id
            sessions = sessions.filter(governorate_id=gov_id)
        elif scope_type == 'school':
             sessions = sessions.filter(school_id=scope_id)
        
        n_scope = sessions.count()
        n_nat = national_sessions.count()

        if n_scope == 0:
            return Response({"detail": "No data for this scope."}, status=404)

        data = SentinelleAnalytics.get_section_stats(section_id, sessions, national_sessions)
        data['correlations'] = SentinelleAnalytics.get_section_correlations(section_id, sessions)

        return Response(data)
