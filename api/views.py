import csv
import json
from datetime import date

from rest_framework import generics, permissions, status, views
from rest_framework.response import Response
from django.conf import settings
from django.db.models import Count, Q, Avg
from django.contrib.auth import get_user_model
from django.db import models
from django.http import HttpResponse, StreamingHttpResponse
from .models import (
    Governorate, SchoolEstablishment, SchoolClass, QuestionnaireSession,
    SectionA, SectionB, SectionC, SectionD, SectionE, SectionG, SectionH,
    SectionI, SectionJ, SectionK, SectionL, SectionM, SectionN, SectionP,
    SectionQ, SectionR, SectionS, SectionT, SectionU, SectionV, SectionZ,
)
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

class QuestionnaireExportView(views.APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request):
        can_export = False
        if request.user and getattr(request.user, 'role', None) == 'SUPERADMIN':
            can_export = True
        elif request.query_params.get('mock') == 'true' and (
            settings.DEBUG or
            request.get_host().startswith('localhost') or
            request.get_host().startswith('127.0.0.1')
        ):
            can_export = True

        if not can_export:
            return Response({"detail": "Not authorized."}, status=status.HTTP_403_FORBIDDEN)

        section_models = {
            'section_a': SectionA,
            'section_b': SectionB,
            'section_c': SectionC,
            'section_d': SectionD,
            'section_e': SectionE,
            'section_g': SectionG,
            'section_h': SectionH,
            'section_i': SectionI,
            'section_j': SectionJ,
            'section_k': SectionK,
            'section_l': SectionL,
            'section_m': SectionM,
            'section_n': SectionN,
            'section_p': SectionP,
            'section_q': SectionQ,
            'section_r': SectionR,
            'section_s': SectionS,
            'section_t': SectionT,
            'section_u': SectionU,
            'section_v': SectionV,
            'section_z': SectionZ,
        }

        section_keys = list(section_models.keys())
        related_fields = ['school', 'governorate', 'school_class'] + section_keys
        sessions = QuestionnaireSession.objects.select_related(*related_fields).all()

        base_fields = [
            'session_id', 'created_at', 'language_used',
            'school_class', 'school', 'governorate',
            'tobacco_user', 'ecig_user', 'hookah_user', 'alcohol_user',
            'tranquilizer_user', 'cannabis_user', 'cocaine_user',
            'ecstasy_user', 'heroin_user', 'inhalant_user', 'has_risk_behavior',
        ]

        section_fieldnames = []
        for section_key, model in section_models.items():
            for field in model._meta.concrete_fields:
                if field.name in ('id', 'session'):
                    continue
                section_fieldnames.append(f"{section_key}_{field.name}")

        fieldnames = base_fields + section_fieldnames

        class Echo:
            def write(self, value):
                return value

        def csv_stream():
            writer = csv.DictWriter(Echo(), fieldnames=fieldnames)
            yield writer.writeheader()
            for session in sessions:
                row = {
                    'session_id': session.id,
                    'created_at': session.created_at.isoformat(),
                    'language_used': session.language_used,
                    'school_class': getattr(session.school_class, 'name', ''),
                    'school': getattr(session.school, 'name', ''),
                    'governorate': getattr(session.governorate, 'name', ''),
                    'tobacco_user': session.tobacco_user,
                    'ecig_user': session.ecig_user,
                    'hookah_user': session.hookah_user,
                    'alcohol_user': session.alcohol_user,
                    'tranquilizer_user': session.tranquilizer_user,
                    'cannabis_user': session.cannabis_user,
                    'cocaine_user': session.cocaine_user,
                    'ecstasy_user': session.ecstasy_user,
                    'heroin_user': session.heroin_user,
                    'inhalant_user': session.inhalant_user,
                    'has_risk_behavior': session.has_risk_behavior,
                }

                for section_key, model in section_models.items():
                    section = getattr(session, section_key, None)
                    if not section:
                        continue
                    for field in model._meta.concrete_fields:
                        if field.name in ('id', 'session'):
                            continue
                        value = getattr(section, field.name)
                        if isinstance(value, (dict, list)):
                            value = json.dumps(value, ensure_ascii=False)
                        row[f"{section_key}_{field.name}"] = value

                yield writer.writerow(row)

        response = StreamingHttpResponse(csv_stream(), content_type='text/csv; charset=utf-8')
        response['Content-Disposition'] = f'attachment; filename="questionnaire_answers_{date.today().isoformat()}.csv"'
        return response

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
    permission_classes = (permissions.AllowAny,)

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
    permission_classes = (permissions.AllowAny,)

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
        from .models import Governorate, QuestionnaireSession, SchoolEstablishment
        user = request.user
        scope_type = request.query_params.get('scope_type', 'national')
        scope_id = request.query_params.get('scope_id')

        # 🎯 HARD AUTHORITY LIMITS
        # Override requested scope based on the user's secure server-side role
        if user.is_authenticated:
            if user.role == 'ADMIN' and getattr(user, 'governorate', None):
                scope_type = 'gouvernorate'
                scope_id = user.governorate.id
            elif user.role == 'USER' and getattr(user, 'establishment', None):
                scope_type = 'user_school'
                scope_id = user.establishment.id

        # 1. Base Query — National Baseline
        sessions = QuestionnaireSession.objects.all()
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
            if not gov and user.is_authenticated and user.role == 'ADMIN':
                gov = user.governorate
            
            # 🎯 Priority 2: No Fallback to Tunis (Phase 6 Explicit Choice)
            if not gov:
                # If no governorate was found, stay in national scope to show the selector
                scope_type = 'national'
                sessions = QuestionnaireSession.objects.all()
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

            # Secure Region Collection: Limit iteration for ADMINs to stop data leakage
            govs_to_process = Governorate.objects.all()
            if user.is_authenticated and user.role == 'ADMIN' and getattr(user, 'governorate', None):
                govs_to_process = Governorate.objects.filter(id=user.governorate.id)

            for g in govs_to_process:
                s_count = SchoolEstablishment.objects.filter(governorate=g).count()
                gov_sessions = QuestionnaireSession.objects.filter(governorate=g)
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
            
            # SECURE: Strip map data for unauthorized regions if ADMIN
            if user.is_authenticated and user.role == 'ADMIN' and getattr(user, 'governorate', None):
                gov_name = user.governorate.name
                for region in heat_data.keys():
                    if region.lower() != gov_name.lower():
                        heat_data[region] = {"submissions": 0, "prevalence": 0, "active": False}

            data['map_data'] = heat_data
            
        if not data:
            return Response({"headline": {"scope_label": scope_label, "n_submissions": 0}, "kpis": []}, status=200)

        # 🏙️ 4. Comparative Ranking Logic (Phase 5 Competitive Intel)
        if scope_type in ['gouvernorate', 'national']:
            data['rankings'] = SentinelleAnalytics.get_regional_rankings()

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

        # 🎯 HARD AUTHORITY LIMITS
        # Override requested scope based on the user's secure server-side role
        if user.is_authenticated:
            if user.role == 'ADMIN' and getattr(user, 'governorate', None):
                scope_type = 'gouvernorate'
                scope_id = user.governorate.id
            elif user.role == 'USER' and getattr(user, 'establishment', None):
                scope_type = 'user_school'
                scope_id = user.establishment.id

        # 1. Base Query — Symmetric with HomepageView
        sessions = QuestionnaireSession.objects.all()

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
            if not gov and user.is_authenticated and user.role == 'ADMIN':
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
        return Response(data)
class LabStatsView(views.APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request):
        # Pass the authenticated user to scope data based on role/governorate
        user = request.user if request.user.is_authenticated else None
        data = SentinelleAnalytics.get_lab_stats(user=user)
        return Response(data)
