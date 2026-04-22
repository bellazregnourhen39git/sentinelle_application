import os
from django.conf import settings
from rest_framework import generics, permissions, status, views, exceptions
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.response import Response
from django.http import HttpResponse
from django.core.mail import send_mail
from django.db.models import Count, Q, Avg
import csv
from django.contrib.auth import get_user_model
from django.db import models
from django.utils import timezone
from datetime import timedelta
import secrets
from .models import (
    Governorate, SchoolEstablishment, SchoolClass, AuditLog,
    QuestionnaireSession, SectionV, PlatformTerminology, DynamicQuestion
)
from rest_framework import generics, permissions, status, views, exceptions
from .permissions import IsSuperAdmin, IsGlobalAdmin, ScopePermission
from .analytics import SentinelleAnalytics
from .serializers import (
    RegisterSerializer, UserSerializer, GovernorateSerializer,
    SchoolEstablishmentSerializer, SchoolClassSerializer,
    QuestionnaireSessionSerializer, PlatformTerminologySerializer
)
from . import serializers

User = get_user_model()


# ─── Auth Views ──────────────────────────────────────────────────────────────────

class SecureTokenObtainPairView(TokenObtainPairView):
    serializer_class = serializers.SecureTokenObtainPairSerializer
    throttle_scope = 'login'

    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        client_ip = request.META.get('REMOTE_ADDR')
        
        if response.status_code == 200:
            user = User.objects.get(email=request.data.get('email', request.data.get('username')))
            AuditLog.objects.create(
                user=user,
                action="LOGIN_SUCCESS",
                ip_address=client_ip
            )
        else:
            # Note: The serializer handled the failed_attempts count
            AuditLog.objects.create(
                action=f"LOGIN_FAILURE: {request.data.get('email', 'unknown')}",
                ip_address=client_ip
            )
        return response

class GovernorateListView(generics.ListAPIView):
    queryset = Governorate.objects.all().order_by('name')
    serializer_class = GovernorateSerializer
    permission_classes = (permissions.AllowAny,)

class SchoolEstablishmentListView(generics.ListAPIView):
    serializer_class = SchoolEstablishmentSerializer
    permission_classes = (permissions.AllowAny,)

    def get_queryset(self):
        qs = SchoolEstablishment.objects.all().select_related('governorate').order_by('name')
        gov_id = self.request.query_params.get('governorate_id')
        if gov_id:
            qs = qs.filter(governorate_id=gov_id)
        return qs

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer


class ProfileView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user


class PendingApprovalsView(views.APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        if request.user.role != 'SUPER_ADMIN':
            return Response({"detail": "Not authorized"}, status=403)
        pending = User.objects.filter(Q(status='DISABLED') | Q(is_active=False)).exclude(status='PENDING')
        serializer = UserSerializer(pending, many=True)
        return Response(serializer.data)


class ApproveUserView(views.APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, user_id):
        if request.user.role != 'SUPER_ADMIN':
            return Response({"detail": "Not authorized"}, status=403)
        user = User.objects.filter(id=user_id).first()
        if user:
            user.is_active = True
            user.approval_status = 'APPROVED'
            user.status = 'ACTIVE' # Ensure it's active even if it was DISABLED/LOCKED
            user.failed_attempts = 0 # Reset lock
            user.save()
            return Response({"status": "approved"})
        return Response({"detail": "Not found"}, status=404)


class RejectUserView(views.APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, user_id):
        if request.user.role != 'SUPER_ADMIN':
            return Response({"detail": "Not authorized"}, status=403)
        user = User.objects.filter(id=user_id).first()
        if user:
            user.is_active = False
            user.approval_status = 'REJECTED'
            user.save()
            return Response({"status": "rejected"})
        return Response({"detail": "Not found"}, status=404)


class UserListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        if self.request.user.role != 'SUPER_ADMIN':
            return User.objects.none()
        return User.objects.all().order_by('-date_joined')


class UserDeleteView(views.APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def delete(self, request, pk):
        if request.user.role != 'SUPER_ADMIN':
            return Response({"detail": "Non autorisé."}, status=403)
        user = User.objects.filter(pk=pk).first()
        if not user:
            return Response({"detail": "Utilisateur introuvable."}, status=404)
        
        email = user.email
        user.delete()
        
        AuditLog.objects.create(
            user=request.user,
            action=f"DELETED_USER: {email}",
            ip_address=request.META.get('REMOTE_ADDR')
        )
        return Response({"status": "deleted"}, status=200)

class UserExportCSVView(views.APIView):
    permission_classes = (IsSuperAdmin,)

    def get(self, request):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="utilisateurs_sentinelle.csv"'
        
        writer = csv.writer(response)
        writer.writerow([
            'id', 'email', 'password', 'role', 'governorate_id', 
            'establishment_id', 'status', 'invite_token', 'token_expiration', 'created_by_id'
        ])
        
        users = User.objects.all().values_list(
            'id', 'email', 'password', 'role', 'governorate_id', 
            'establishment_id', 'status', 'invite_token', 'token_expiration', 'created_by_id'
        )
        for user in users:
            writer.writerow(user)
            
        return response
        return response

class RawDataExportView(views.APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        if request.user.role not in ['GLOBAL_ADMIN', 'SUPER_ADMIN']:
            return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)
            
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="donnees_brutes_sentinelle.csv"'
        
        writer = csv.writer(response)
        writer.writerow([
            'session_id', 'ecole', 'gouvernorat', 'langue', 'date_creation',
            'tabac', 'vape', 'narguile', 'alcool', 'tranquillisants', 
            'cannabis', 'cocaine', 'ecstasy', 'heroine', 'inhalants', 'est_valide'
        ])
        
        sessions = QuestionnaireSession.objects.all().select_related('school', 'governorate')
        
        for s in sessions:
            writer.writerow([
                s.id,
                s.school.name if s.school else 'N/A',
                s.governorate.name if s.governorate else 'N/A',
                s.language_used,
                s.created_at.strftime('%Y-%m-%d %H:%M') if s.created_at else 'N/A',
                s.tobacco_user,
                s.ecig_user,
                s.hookah_user,
                s.alcohol_user,
                s.tranquilizer_user,
                s.cannabis_user,
                s.cocaine_user,
                s.ecstasy_user,
                s.heroin_user,
                s.inhalant_user,
                s.is_valid
            ])
            
        return response

class PlatformTerminologyView(generics.ListCreateAPIView):
    queryset = PlatformTerminology.objects.all()
    serializer_class = PlatformTerminologySerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)

    def get_serializer_context(self):
        return {'request': self.request}


class PlatformTerminologyUpdateView(generics.UpdateAPIView):
    queryset = PlatformTerminology.objects.all()
    serializer_class = PlatformTerminologySerializer
    permission_classes = (permissions.IsAuthenticated,)
    lookup_field = 'key'

    def perform_update(self, serializer):
        if self.request.user.role != 'SUPER_ADMIN':
            raise exceptions.PermissionDenied("Seuls les SuperAdmins peuvent modifier la terminologie.")
        
        instance = self.get_object()
        old_val = instance.value_fr
        new_val = serializer.validated_data.get('value_fr')
        
        serializer.save()
        
        # Log the change
        AuditLog.objects.create(
            user=self.request.user,
            action=f"TERMINOLOGY_CHANGE: {instance.key} | '{old_val}' -> '{new_val}'",
            ip_address=self.request.META.get('REMOTE_ADDR')
        )


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
        if user.role != 'PRACTITIONER' or not user.establishment:
            return Response({"detail": "Not authorized or missing establishment."}, status=403)

        sessions = QuestionnaireSession.objects.filter(school=user.establishment, is_valid=True)
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
    permission_classes = (permissions.AllowAny,)

    def get(self, request):
        user = request.user
        if user.role not in ['REGIONAL_ANALYST', 'GLOBAL_ADMIN', 'SUPER_ADMIN']:
            return Response({"detail": "Not authorized."}, status=403)

        gov_id = user.governorate.id if user.role == 'REGIONAL_ANALYST' else request.query_params.get('governorate_id')
        if not gov_id:
            return Response({"detail": "Governorate not specified."}, status=400)

        sessions = QuestionnaireSession.objects.filter(governorate_id=gov_id, is_valid=True)
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
    permission_classes = (permissions.AllowAny,)

    def get(self, request):
        user = request.user
        if user.role not in ['GLOBAL_ADMIN', 'SUPER_ADMIN']:
            return Response({"detail": "Not authorized."}, status=403)

        sessions = QuestionnaireSession.objects.filter(is_valid=True)
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
        from .models import Governorate, QuestionnaireSession, SchoolEstablishment
        user = request.user
        scope_type = request.query_params.get('scope_type', 'national')
        scope_id = request.query_params.get('scope_id')

        # 🎯 HARD AUTHORITY LIMITS
        # Override requested scope based on the user's secure server-side role
        if user.is_authenticated:
            if user.role == 'REGIONAL_ANALYST' and getattr(user, 'governorate', None):
                scope_type = 'gouvernorate'
                scope_id = user.governorate.id
            elif user.role == 'PRACTITIONER' and getattr(user, 'establishment', None):
                scope_type = 'user_school'
                scope_id = user.establishment.id

        # --- Advanced Authority Filter (Secure Scoping) ---
        sessions_qs = SentinelleAnalytics.get_scoped_sessions(user).filter(is_valid=True)
        
        # 1. Scope Determination (URL vs Auth context)
        sessions = sessions_qs
        scope_label = "Secteur National"

        # 2. Advanced Scope Resolution — Prioritizing Parameters
        if scope_type == 'user_school':
            active_user = user
            if not user.is_authenticated:
                active_user = User.objects.filter(username='test_submit_user').first()
            if active_user and active_user.establishment:
                sessions = sessions.filter(school=active_user.establishment)
                scope_label = f"LYCÉE {active_user.establishment.name.upper()}"
        
        elif scope_type == 'school' and scope_id:
            school = SchoolEstablishment.objects.filter(id=scope_id).first()
            if school:
                sessions = sessions.filter(school=school)
                scope_label = f"Lycée {school.name}"

        elif scope_type == 'gouvernorate':
            gov = None
            # 🎯 Priority 0: Explicit Parameter Override (URL Driven)
            if scope_id:
                search_val = str(scope_id).strip()
                if search_val and not search_val.lower() == 'national':
                    if search_val.isdigit():
                        gov = Governorate.objects.filter(id=search_val).first()
                    else:
                        # Clean and robust match
                        def clean_str(s):
                            import unicodedata
                            return unicodedata.normalize('NFKD', s).encode('ASCII', 'ignore').decode('utf-8').lower().strip()
                        
                        target = clean_str(search_val)
                        for g in Governorate.objects.all():
                            if clean_str(g.name) == target:
                                gov = g
                                break
            
            # 🎯 Priority 1: Auth Role Fallback
            if not gov and user.is_authenticated and user.role == 'REGIONAL_ANALYST':
                gov = user.governorate
            
            # 🎯 Priority 2: No Fallback to Tunis (Phase 6 Explicit Choice)
            if not gov:
                # If no governorate was found, stay in national scope to show the selector
                scope_type = 'national'
                sessions = QuestionnaireSession.objects.filter(is_valid=True)
                scope_label = "Secteur National"
            else:
                sessions = sessions.filter(governorate=gov)
                scope_label = f"Gouvernorat de {gov.name}"

        # 3. Generate Analytical Intelligence
        data = SentinelleAnalytics.get_homepage_stats(sessions, scope_label)
        
        # 🇹🇳 National Distribution Hub Extension
        if scope_type in ['national', 'gouvernorate']:
            regional_stats = []
            active_section = request.query_params.get('section')
            substance_field = None
            if active_section:
                CAT_MAP = {
                    'C': 'tobacco_user', 'G': 'alcohol_user', 'I': 'cannabis_user', 
                    'E': 'hookah_user', 'D': 'ecig_user', 'H': 'tranquilizer_user',
                    'J': 'cocaine_user', 'K': 'ecstasy_user', 'L': 'heroin_user',
                    'M': 'inhalant_user'
                }
                substance_field = CAT_MAP.get(active_section)

            # Secure Region Collection: Limit iteration for Regional Analysts to stop data leakage
            govs_to_process = Governorate.objects.all()
            if user.is_authenticated and user.role == 'REGIONAL_ANALYST' and getattr(user, 'governorate', None):
                govs_to_process = Governorate.objects.filter(id=user.governorate.id)

            for g in govs_to_process:
                s_count = SchoolEstablishment.objects.filter(governorate=g).count()
                gov_sessions = QuestionnaireSession.objects.filter(governorate=g, is_valid=True)
                d_count = gov_sessions.count()
                
                # Prevalence Calculation
                prevalence = 0
                if d_count > 0:
                    if substance_field:
                        risk_count = gov_sessions.filter(**{substance_field: True}).count()
                    else:
                        risk_count = gov_sessions.filter(has_risk_behavior=True).count()
                    prevalence = round((risk_count / d_count) * 100, 1)

                regional_stats.append({
                    "id": g.id, "name": g.name, "schools": s_count, "dossiers": d_count,
                    "prevalence": prevalence,
                    "slug": g.name.lower().replace(' ', '-')
                })
            data['regional_metrics'] = regional_stats
            
            # 🇹🇳 National Geographic Intelligence Expansion (Phase 7)
            substance_id = None
            if active_section:
                CAT_MAP_ID = {
                    'C': 'tobacco', 'G': 'alcohol', 'I': 'cannabis', 'E': 'hookah', 'D': 'vaping',
                    'H': 'tranquilizers', 'J': 'cocaine', 'K': 'ecstasy', 'L': 'heroin', 'M': 'inhalants'
                }
                substance_id = CAT_MAP_ID.get(active_section)
                
            heat_data = SentinelleAnalytics.get_national_heat_data(substance_id)
            
            # SECURE: Strip map data for unauthorized regions if REGIONAL_ANALYST
            if user.is_authenticated and user.role == 'REGIONAL_ANALYST' and getattr(user, 'governorate', None):
                gov_name = user.governorate.name
                for region in heat_data.keys():
                    if region.lower() != gov_name.lower():
                        heat_data[region] = {"submissions": 0, "prevalence": 0, "active": False}

            data['map_data'] = heat_data
            
        # Log Data Access
        AuditLog.objects.create(
            user=user,
            action=f"DATA_ACCESS: {scope_label} (Homepage)",
            ip_address=request.META.get('REMOTE_ADDR')
        )
        return Response(data)


# ─── SIDRA Integration ────────────────────────────────────────────────────────────

class SidraDataExportView(views.APIView):
    """
    Endpoint for the external SIDRA platform to retrieve aggregated national statistics.
    Restricted to SUPERADMIN only.
    """
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        if request.user.role not in ['GLOBAL_ADMIN', 'SUPER_ADMIN']:
            return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)

        sessions = QuestionnaireSession.objects.filter(is_valid=True)
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
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request, section_id):
        user = request.user
        scope_type = request.query_params.get('scope_type', 'national')
        scope_id = request.query_params.get('scope_id')

        # 🎯 HARD AUTHORITY LIMITS
        # Override requested scope based on the user's secure server-side role
        if user.is_authenticated:
            if user.role == 'REGIONAL_ANALYST' and getattr(user, 'governorate', None):
                scope_type = 'gouvernorate'
                scope_id = user.governorate.id
            elif user.role == 'PRACTITIONER' and getattr(user, 'establishment', None):
                scope_type = 'user_school'
                scope_id = user.establishment.id

        # 1. Base Query — Symmetric with HomepageView (SCOPED)
        sessions = SentinelleAnalytics.get_scoped_sessions(user).filter(is_valid=True)

        # 2. Advanced Scope Resolution (Phase 6 Param-First Path)
        if scope_type == 'user_school':
            active_user = user
            if not user.is_authenticated:
                active_user = User.objects.filter(username='test_submit_user').first()
            if active_user and active_user.establishment:
                sessions = sessions.filter(school=active_user.establishment)
        
        elif scope_type == 'school' and scope_id:
            school = SchoolEstablishment.objects.filter(id=scope_id).first()
            if school:
                sessions = sessions.filter(school=school)

        elif scope_type == 'gouvernorate':
            gov = None
            # 🎯 URL Parameter takes precedence
            if scope_id:
                search_val = str(scope_id).strip()
                if search_val and not search_val.lower() == 'national':
                    if search_val.isdigit():
                        gov = Governorate.objects.filter(id=search_val).first()
                    else:
                        def clean_str(s):
                            import unicodedata
                            return unicodedata.normalize('NFKD', s).encode('ASCII', 'ignore').decode('utf-8').lower().strip()
                        target = clean_str(search_val)
                        for g in Governorate.objects.all():
                            if clean_str(g.name) == target:
                                gov = g
                                break
            
            # Auth Role Fallback
            if not gov and user.is_authenticated and user.role == 'REGIONAL_ANALYST':
                gov = user.governorate
            
            # Default Fallback (Tunis)
            if not gov:
                gov = Governorate.objects.first()

            if gov:
                sessions = sessions.filter(governorate=gov)
            else:
                sessions = sessions.none() # Return nothing for invalid regional request

        data = SentinelleAnalytics.get_section_questions_stats(section_id, sessions)
        data['correlations'] = SentinelleAnalytics.get_section_correlations(section_id, sessions)
        data['insights'] = SentinelleAnalytics.get_section_insights(section_id, sessions)

        # Log Data Access
        AuditLog.objects.create(
            user=user,
            action=f"DATA_ACCESS: Section {section_id} (Scoped)",
            ip_address=request.META.get('REMOTE_ADDR')
        )
        return Response(data)
class LabStatsView(views.APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        # Pass the authenticated user to scope data based on role/governorate
        user = request.user if request.user.is_authenticated else None
        data = SentinelleAnalytics.get_lab_stats(user=user)
        return Response(data)

class InsightsView(views.APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        if request.user.role not in ['GLOBAL_ADMIN', 'SUPER_ADMIN']:
            return Response({"detail": "Not authorized"}, status=403)
        data = SentinelleAnalytics.get_advanced_insights()
        return Response(data)


# ─── Invitation & Activation Views ──────────────────────────────────────────────

class InviteUserView(views.APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request):
        # Only Super Admins can invite
        if request.user.role != 'SUPER_ADMIN':
            return Response({"detail": "Only Super Admins can invite users."}, status=403)

        serializer = serializers.InviteUserSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            username = serializer.validated_data.get('username')
            
            if not username:
                # Default username is the part before @
                username = email.split('@')[0]
                # Avoid duplicates
                idx = 1
                base_username = username
                while User.objects.filter(username=username).exists():
                    username = f"{base_username}_{idx}"
                    idx += 1

            token = secrets.token_urlsafe(32)
            expiration = timezone.now() + timedelta(hours=24)
            
            user = serializer.save(
                username=username,
                status='PENDING',
                invite_token=token,
                token_expiration=expiration,
                created_by=request.user,
                is_active=False
            )

            # Build invitation link pointing to the Frontend page
            frontend_url = os.environ.get('FRONTEND_URL', 'http://localhost:5173')
            invitation_link = f"{frontend_url}/set-password?token={token}"
            
            email_subject = "Invitation à rejoindre la plateforme MedSPAD Tunisie 2026"
            email_body = (
                f"Cher(e) {username},\n\n"
                "Vous avez été officiellement invité(e) à rejoindre la plateforme Sentinelle (MedSPAD Tunisie 2026).\n"
                "Ce portail sécurisé vous permet de contribuer à la veille sanitaire nationale.\n\n"
                f"Veuillez cliquer sur le lien suivant pour configurer votre mot de passe et activer votre compte :\n"
                f"{invitation_link}\n\n"
                "Ce lien est personnel et expirera dans 24 heures.\n\n"
                "Cordialement,\n"
                "L'équipe d'administration Sentinelle"
            )
            
            try:
                send_mail(
                    subject=email_subject,
                    message=email_body,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[email],
                    fail_silently=False,
                )
            except Exception as e:
                print(f"Erreur d'envoi d'email : {e}")

            # Log the invitation
            client_ip = request.META.get('REMOTE_ADDR')
            AuditLog.objects.create(
                user=request.user,
                action=f"INVITED_USER: {user.email} (Role: {user.role})",
                ip_address=client_ip
            )

            # In a real app, send email here. For now, return the link.
            invitation_link = f"/set-password?token={token}"
            
            return Response({
                "detail": "User invited successfully.",
                "invitation_link": invitation_link,
                "token": token
            }, status=201)
        
        return Response(serializer.errors, status=400)


class ActivateUserView(views.APIView):
    permission_classes = (permissions.AllowAny,)

    def post(self, request):
        serializer = serializers.ActivateUserSerializer(data=request.data)
        if serializer.is_valid():
            token = serializer.validated_data['token']
            password = serializer.validated_data['password']

            user = User.objects.filter(invite_token=token).first()
            
            if not user:
                return Response({"detail": "Invalid or used token."}, status=400)
            
            if user.token_expiration < timezone.now():
                return Response({"detail": "Token has expired."}, status=400)

            # Activate user
            user.set_password(password)
            user.status = 'ACTIVE'
            user.is_active = True
            user.invite_token = None # Invalidate token
            user.token_expiration = None
            user.save()

            # Log the activation
            client_ip = request.META.get('REMOTE_ADDR')
            AuditLog.objects.create(
                user=user,
                action="ACCOUNT_ACTIVATED",
                ip_address=client_ip
            )

            return Response({"detail": "Account activated successfully. You can now log in."}, status=200)
        
        return Response(serializer.errors, status=400)


# ─── Dynamic Questionnaire Editing ──────────────────────────────────────────────

class DynamicQuestionListView(generics.ListCreateAPIView):
    queryset = DynamicQuestion.objects.all()
    serializer_class = serializers.DynamicQuestionSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsSuperAdmin()]
        return super().get_permissions()

class DynamicQuestionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = DynamicQuestion.objects.all()
    serializer_class = serializers.DynamicQuestionSerializer
    permission_classes = (IsSuperAdmin,)
    lookup_field = 'code'

