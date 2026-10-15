import logging
import os
import csv
import json
import secrets
from datetime import date, timedelta

from django.conf import settings
from django.db import models
from django.db.models import Count, Q, Avg
from django.http import HttpResponse, StreamingHttpResponse
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.core.mail import send_mail, EmailMultiAlternatives
import hashlib
import hmac

from rest_framework import generics, permissions, status, views, exceptions
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView

from .models import (
    Governorate, SchoolEstablishment, SchoolClass, QuestionnaireSession,
    SectionA, SectionB, SectionC, SectionD, SectionE, SectionG, SectionH,
    SectionI, SectionJ, SectionK, SectionL, SectionM, SectionN, SectionP,
    SectionQ, SectionR, SectionS, SectionT, SectionU, SectionV, SectionZ,
    AuditLog, PlatformTerminology, DynamicQuestion, ClassReport, DynamicClassReportField
)
from .analytics import SentinelleAnalytics
from .permissions import IsSuperAdmin, IsGlobalAdmin, ScopePermission
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
        identifier = request.data.get('email') or request.data.get('username')

        if response.status_code == 200:
            user = User.objects.filter(Q(email=identifier) | Q(username=identifier)).first()
            if user:
                AuditLog.objects.create(
                    user=user,
                    action="LOGIN_SUCCESS",
                    ip_address=client_ip
                )
        else:
            AuditLog.objects.create(
                action=f"LOGIN_FAILURE: {identifier or 'unknown'}",
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
        gov = self.request.query_params.get('governorate_id') or self.request.query_params.get('governorate') or self.request.query_params.get('region')
        if gov:
            if str(gov).isdigit():
                qs = qs.filter(governorate_id=int(gov))
            else:
                qs = qs.filter(governorate__name__iexact=str(gov).strip())
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
        
        if user.id == request.user.id:
            return Response({"detail": "Vous ne pouvez pas supprimer votre propre compte."}, status=400)

        email = user.email
        try:
            user.delete()
        except Exception as e:
            return Response({"detail": f"Erreur lors de la suppression: {str(e)}"}, status=400)
        
        try:
            ip = (request.META.get('HTTP_X_FORWARDED_FOR') or '').split(',')[0].strip() or request.META.get('REMOTE_ADDR')
            AuditLog.objects.create(
                user=request.user,
                action=f"DELETED_USER: {email}",
                ip_address=ip if ip else None
            )
        except Exception:
            pass

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
        user = request.user
        
        # Scoped sessions matching user role
        sessions = SentinelleAnalytics.get_scoped_sessions(user).select_related(
            'school', 'governorate', 'class_report'
        ).prefetch_related(
            'section_a', 'section_b', 'section_c', 'section_d',
            'section_e', 'section_g', 'section_h', 'section_i',
            'section_j', 'section_k', 'section_l', 'section_m',
            'section_n', 'section_p', 'section_q', 'section_r',
            'section_s', 'section_t', 'section_u', 'section_v',
            'section_z'
        )

        response = HttpResponse(content_type='text/csv; charset=utf-8')
        response['Content-Disposition'] = 'attachment; filename="donnees_brutes_sentinelle.csv"'
        # Write UTF-8 BOM so Excel displays non-ASCII characters without encoding glitches
        response.write('\ufeff')

        SECTION_MAPPINGS = [
            ('section_a', SectionA, 'A'),
            ('section_b', SectionB, 'B'),
            ('section_c', SectionC, 'C'),
            ('section_d', SectionD, 'D'),
            ('section_e', SectionE, 'E'),
            ('section_g', SectionG, 'G'),
            ('section_h', SectionH, 'H'),
            ('section_i', SectionI, 'I'),
            ('section_j', SectionJ, 'J'),
            ('section_k', SectionK, 'K'),
            ('section_l', SectionL, 'L'),
            ('section_m', SectionM, 'M'),
            ('section_n', SectionN, 'N'),
            ('section_p', SectionP, 'P'),
            ('section_q', SectionQ, 'Q'),
            ('section_r', SectionR, 'R'),
            ('section_s', SectionS, 'S'),
            ('section_t', SectionT, 'T'),
            ('section_u', SectionU, 'U'),
            ('section_v', SectionV, 'V'),
            ('section_z', SectionZ, 'Z'),
        ]

        headers = [
            'session_id', 'ecole', 'gouvernorat', 'rapport_classe', 'langue', 'date_creation', 'est_valide',
            'has_risk_behavior', 'tabac', 'vape', 'narguile', 'alcool', 'tranquillisants',
            'cannabis', 'cocaine', 'ecstasy', 'heroine', 'inhalants'
        ]

        section_field_map = {}
        for rel_name, model_cls, sec_letter in SECTION_MAPPINGS:
            fields = [f.name for f in model_cls._meta.get_fields() if f.name not in ['id', 'session']]
            section_field_map[rel_name] = fields
            for f in fields:
                headers.append(f"{sec_letter}_{f}")

        writer = csv.writer(response)
        writer.writerow(headers)

        for s in sessions:
            row = [
                s.id,
                s.school.name if s.school else '',
                s.governorate.name if s.governorate else '',
                s.class_report.establishment_name if s.class_report else '',
                s.language_used,
                s.created_at.strftime('%Y-%m-%d %H:%M') if s.created_at else '',
                1 if s.is_valid else 0,
                1 if s.has_risk_behavior else 0,
                1 if s.tobacco_user else 0,
                1 if s.ecig_user else 0,
                1 if s.hookah_user else 0,
                1 if s.alcohol_user else 0,
                1 if s.tranquilizer_user else 0,
                1 if s.cannabis_user else 0,
                1 if s.cocaine_user else 0,
                1 if s.ecstasy_user else 0,
                1 if s.heroin_user else 0,
                1 if s.inhalant_user else 0,
            ]

            for rel_name, model_cls, sec_letter in SECTION_MAPPINGS:
                sec_obj = getattr(s, rel_name, None)
                fields = section_field_map[rel_name]
                for f in fields:
                    if not sec_obj:
                        row.append('')
                    else:
                        val = getattr(sec_obj, f, None)
                        if val is None:
                            row.append('')
                        elif isinstance(val, (dict, list)):
                            row.append(json.dumps(val, ensure_ascii=False))
                        elif isinstance(val, bool):
                            row.append('1' if val else '0')
                        else:
                            row.append(str(val))
            writer.writerow(row)

        AuditLog.objects.create(
            user=user,
            action="EXPORT: Raw Questionnaire Data (Full Survey)",
            ip_address=request.META.get('REMOTE_ADDR')
        )

        return response

class PlatformTerminologyView(generics.ListCreateAPIView):
    queryset = PlatformTerminology.objects.all()
    serializer_class = PlatformTerminologySerializer
    permission_classes = (permissions.AllowAny,)

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

class QuestionnaireSubmissionListView(generics.ListAPIView):
    serializer_class = serializers.QuestionnaireSessionListSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        user = self.request.user
        qs = QuestionnaireSession.objects.all().select_related('school', 'governorate')
        
        # Filter by class_report if provided
        report_id = self.request.query_params.get('class_report')
        if report_id:
            qs = qs.filter(class_report_id=report_id)
            if user.role not in ['SUPER_ADMIN', 'GLOBAL_ADMIN', 'SUPERADMIN', 'ADMIN']:
                if user.role == 'REGIONAL_ADMIN' and user.governorate:
                    qs = qs.filter(governorate=user.governorate)
                elif user.role in ['PRACTITIONER', 'OPERATOR']:
                    qs = qs.filter(class_report__created_by=user)
            return qs.order_by('-created_at')
            
        # Global listing role-based security filtering
        if user.role not in ['SUPER_ADMIN', 'GLOBAL_ADMIN', 'SUPERADMIN', 'ADMIN']:
            if user.role == 'REGIONAL_ADMIN':
                if user.governorate:
                    qs = qs.filter(governorate=user.governorate)
            elif user.role in ['PRACTITIONER', 'OPERATOR']:
                qs = qs.filter(class_report__created_by=user)
        
        return qs.order_by('-created_at')


class QuestionnaireSubmissionDetailView(generics.RetrieveUpdateAPIView):
    serializer_class = serializers.QuestionnaireSessionSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        user = self.request.user
        role = getattr(user, 'role', '').upper()
        if role in ['SUPER_ADMIN', 'SUPERADMIN', 'GLOBAL_ADMIN'] or user.is_staff or user.is_superuser:
            return QuestionnaireSession.objects.all().select_related('school', 'governorate')
        elif role == 'REGIONAL_ADMIN':
            if getattr(user, 'governorate', None):
                return QuestionnaireSession.objects.filter(governorate=user.governorate).select_related('school', 'governorate')
            return QuestionnaireSession.objects.none()
        elif role in ['PRACTITIONER', 'OPERATOR']:
            return QuestionnaireSession.objects.filter(class_report__created_by=user).select_related('school', 'governorate')
        return QuestionnaireSession.objects.filter(class_report__created_by=user).select_related('school', 'governorate')

    def update(self, request, *args, **kwargs):
        role = getattr(request.user, 'role', '').upper()
        if role in ['GLOBAL_ADMIN', 'REGIONAL_ADMIN']:
            return Response({"detail": "Les administrateurs globaux et régionaux ont un accès en consultation seule."}, status=403)
        return super().update(request, *args, **kwargs)


class QuestionnaireSubmitView(generics.CreateAPIView):
    """
    Accepts a full nested JSON payload (session + all section sub-objects).
    Creates QuestionnaireSession and all provided section records atomically.
    """
    serializer_class = QuestionnaireSessionSerializer
    permission_classes = (permissions.AllowAny,)

    def create(self, request, *args, **kwargs):
        data = request.data.copy()
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
        role = getattr(request.user, 'role', None)
        if request.user and request.user.is_authenticated and role in {'SUPER_ADMIN', 'SUPERADMIN', 'GLOBAL_ADMIN'}:
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
        if user.role not in ['USER', 'PRACTITIONER', 'OPERATOR', 'REGIONAL_ADMIN', 'GLOBAL_ADMIN', 'SUPER_ADMIN', 'SUPERADMIN'] or not user.establishment:
            if user.role in ['GLOBAL_ADMIN', 'SUPER_ADMIN', 'SUPERADMIN']:
                sessions = QuestionnaireSession.objects.filter(is_valid=True)
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
        if user.role not in ['REGIONAL_ADMIN', 'GLOBAL_ADMIN', 'SUPER_ADMIN', 'SUPERADMIN']:
            return Response({"detail": "Not authorized."}, status=403)

        gov_id = user.governorate.id if user.role == 'REGIONAL_ADMIN' else request.query_params.get('governorate_id')
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
        if user.role not in ['GLOBAL_ADMIN', 'SUPER_ADMIN', 'SUPERADMIN']:
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
            if user.role == 'REGIONAL_ADMIN' and getattr(user, 'governorate', None):
                scope_type = 'gouvernorate'
                scope_id = user.governorate.id
            elif user.role in ['PRACTITIONER', 'OPERATOR'] and not scope_id:
                scope_type = 'practitioner'

        # --- Advanced Authority Filter (Secure Scoping) ---
        sessions_qs = SentinelleAnalytics.get_scoped_sessions(user)
        
        # 1. Scope Determination (URL vs Auth context)
        sessions = sessions_qs
        scope_label = "Secteur National"
        target_school = None
        target_gov = None

        # 2. Advanced Scope Resolution — Prioritizing Parameters
        if scope_type == 'school' and scope_id:
            school = SchoolEstablishment.objects.filter(id=scope_id).first()
            if school:
                target_school = school
                sessions = sessions.filter(school=school)
                s_name = school.name.strip()
                if any(s_name.lower().startswith(prefix) for prefix in ['lycée', 'lycee', 'collège', 'college', 'école', 'ecole']):
                    scope_label = s_name
                else:
                    scope_label = f"Établissement {s_name}"

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
            if not gov and user.is_authenticated and user.role == 'REGIONAL_ADMIN':
                gov = user.governorate
            
            # 🎯 Priority 2: No Fallback to Tunis (Phase 6 Explicit Choice)
            if not gov:
                # If no governorate was found, stay in national scope to show the selector
                scope_type = 'national'
                sessions = sessions_qs
                scope_label = "Secteur National"
            else:
                target_gov = gov
        elif scope_type == 'practitioner':
            sessions = sessions_qs
            scope_label = "Session Praticien"

        # 3. Generate Analytical Intelligence
        data = SentinelleAnalytics.get_homepage_stats(
            sessions, 
            scope_label, 
            scope_type=scope_type, 
            target_gov=target_gov, 
            target_school=target_school
        )
        
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
            if user.is_authenticated and user.role == 'REGIONAL_ADMIN' and getattr(user, 'governorate', None):
                govs_to_process = Governorate.objects.filter(id=user.governorate.id)

            for g in govs_to_process:
                gov_sessions = QuestionnaireSession.objects.filter(governorate=g, is_valid=True)
                d_count = gov_sessions.count()

                cr_schools = set(ClassReport.objects.filter(governorate=g).exclude(establishment_name='').values_list('establishment_name', flat=True))
                sess_schools = set(gov_sessions.filter(school__isnull=False).values_list('school__name', flat=True))
                all_active_schools = cr_schools | sess_schools
                s_count = len(all_active_schools)
                
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

            MAP_THEME_LABELS = {
                'tobacco': 'Tabac',
                'alcohol': 'Alcool',
                'cannabis': 'Cannabis',
                'hookah': 'Narguilé',
                'vaping': 'Cigarettes électroniques',
                'tranquilizers': 'Tranquillisants',
                'cocaine': 'Cocaïne',
                'ecstasy': 'Ecstasy',
                'heroin': 'Héroïne',
                'inhalants': 'Inhalants',
            }
            map_variable_label = (
                f"Taux de prévalence {MAP_THEME_LABELS.get(substance_id)}"
                if substance_id else "Taux de risque comportemental"
            )

            # SECURE: Strip map data for unauthorized regions if REGIONAL_ADMIN
            if user.is_authenticated and user.role == 'REGIONAL_ADMIN' and getattr(user, 'governorate', None):
                gov_name = user.governorate.name
                for region in heat_data.keys():
                    if region.lower() != gov_name.lower():
                        heat_data[region] = {"submissions": 0, "prevalence": 0, "active": False}

            data['map_data'] = heat_data
            data['map_variable'] = {
                "key": substance_id,
                "label": map_variable_label
            }

            # 🏆 Rankings Lab: Include comparative metrics (Phase 8)
            data['rankings'] = SentinelleAnalytics.get_regional_rankings()
            
        # Log Data Access
        AuditLog.objects.create(
            user=user if user.is_authenticated else None,
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
        if request.user.role not in ['GLOBAL_ADMIN', 'SUPER_ADMIN', 'SUPERADMIN']:
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
            if user.role == 'REGIONAL_ADMIN' and getattr(user, 'governorate', None):
                scope_type = 'gouvernorate'
                scope_id = user.governorate.id
            elif user.role in ['PRACTITIONER', 'OPERATOR'] and not scope_id:
                if getattr(user, 'governorate', None):
                    scope_type = 'gouvernorate'
                    scope_id = user.governorate.id
                else:
                    scope_type = 'national'

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
            if not gov and user.is_authenticated and user.role in ['REGIONAL_ADMIN', 'PRACTITIONER', 'OPERATOR']:
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
        user = request.user if request.user.is_authenticated else None
        scope_type = request.query_params.get('scope_type', 'national')
        scope_id = request.query_params.get('scope_id')
        data = SentinelleAnalytics.get_lab_stats(user=user, scope_type=scope_type, scope_id=scope_id)
        return Response(data)

class CorrelationEngineView(views.APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        user = request.user
        scope_type = request.query_params.get('scope_type', 'national')
        scope_id = request.query_params.get('scope_id')

        # Override scope based on secure role
        if user.is_authenticated:
            if user.role == 'REGIONAL_ADMIN' and getattr(user, 'governorate', None):
                scope_type = 'gouvernorate'
                scope_id = user.governorate.id
            elif user.role in ['PRACTITIONER', 'OPERATOR'] and not scope_id:
                if getattr(user, 'governorate', None):
                    scope_type = 'gouvernorate'
                    scope_id = user.governorate.id
                else:
                    scope_type = 'national'

        # Get all valid sessions globally and for the specific scope
        global_sessions = QuestionnaireSession.objects.filter(is_valid=True)
        sessions = SentinelleAnalytics.get_scoped_sessions(user).filter(is_valid=True)

        scope_label = "Secteur National"

        if scope_type == 'school' and scope_id:
            school = SchoolEstablishment.objects.filter(id=scope_id).first()
            if school:
                sessions = sessions.filter(school=school)
                s_name = school.name.strip()
                if any(s_name.lower().startswith(prefix) for prefix in ['lycée', 'lycee', 'collège', 'college', 'école', 'ecole']):
                    scope_label = s_name
                else:
                    scope_label = f"Établissement {s_name}"
        elif scope_type == 'gouvernorate':
            gov = None
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
            if not gov and user.is_authenticated and user.role == 'REGIONAL_ADMIN':
                gov = user.governorate
            
            if gov:
                sessions = sessions.filter(governorate=gov)
                scope_label = f"Gouvernorat de {gov.name}"
            else:
                # If no governorate is found, fall back to national
                scope_type = 'national'
                sessions = global_sessions
                scope_label = "Secteur National"
        else:
            sessions = global_sessions

        # --- AUTOMATED CORRELATION ENGINE (DATA MINING) ---
        import json
        
        def safe_json(val):
            if isinstance(val, dict): return val
            if isinstance(val, str):
                try: return json.loads(val)
                except: return {}
            return {}

        FEATURE_DEFINITIONS = [
            {"id": "violence_initiator", "label": "Initiateur de bagarres", "eval": lambda s: s.get('section_u__fight_circumstances') == '1'},
            {"id": "heavy_cannabis", "label": "Cannabis Intensif", "eval": lambda s: s.get('section_i__months_12_freq') in ['4', '5', '6', '7']},
            {"id": "daily_tobacco", "label": "Tabagisme Quotidien", "eval": lambda s: s.get('section_c__days_30_freq') in ['4', '5', '6', '7']},
            {"id": "alcohol_user", "label": "Consommation d'alcool", "eval": lambda s: s.get('alcohol_user') == True},
            {"id": "failing_grades", "label": "Échec Scolaire", "eval": lambda s: s.get('section_a__academic_performance') == '1'},
            {"id": "high_stress", "label": "Stress Élevé", "eval": lambda s: s.get('section_v__a') in ['4', '5']},
            {"id": "social_media_addict", "label": "Réseaux Sociaux Intensifs", "eval": lambda s: safe_json(s.get('section_r__hours_per_day_breakdown')).get('social_networks') == '6'},
            {"id": "gaming_addict", "label": "Jeux Vidéo Intensifs", "eval": lambda s: s.get('section_s__hours_per_day') == '6'},
            {"id": "gambling_frequent", "label": "Jeux de hasard fréquents", "eval": lambda s: s.get('section_t__months_12_freq') in ['4', '5', '6', '7']},
            {"id": "tranquilizers", "label": "Tranquillisants", "eval": lambda s: s.get('section_h__lifetime_freq') in ['2', '3', '4', '5', '6', '7']},
            {"id": "family_problems", "label": "Problèmes familiaux", "eval": lambda s: safe_json(s.get('section_a__family_relationship_satisfaction')).get('mother') in ['4', '5', '6']},
            {"id": "vape_daily", "label": "Vapotage Quotidien", "eval": lambda s: s.get('section_d__days_30_freq') in ['3', '4']},
            {"id": "victim_fights", "label": "Victime d'agressions", "eval": lambda s: s.get('section_u__fight_circumstances') == '2'},
            {"id": "nights_out", "label": "Sorties nocturnes fréquentes", "eval": lambda s: s.get('section_a__nights_out_30days') in ['4', '5', '6', '7', '8']},
        ]
        
        fields_to_fetch = [
            'section_u__fight_circumstances', 'section_i__months_12_freq', 'section_c__days_30_freq',
            'alcohol_user', 'section_a__academic_performance', 'section_v__a',
            'section_r__hours_per_day_breakdown', 'section_s__hours_per_day',
            'section_t__months_12_freq', 'section_h__lifetime_freq',
            'section_a__family_relationship_satisfaction', 'section_d__days_30_freq',
            'section_a__nights_out_30days'
        ]

        local_data = list(sessions.values(*fields_to_fetch))
        global_data = list(global_sessions.values(*fields_to_fetch))

        def evaluate_features(data_list):
            results = {f["id"]: set() for f in FEATURE_DEFINITIONS}
            for i, s in enumerate(data_list):
                for f in FEATURE_DEFINITIONS:
                    try:
                        if f["eval"](s):
                            results[f["id"]].add(i)
                    except Exception:
                        pass
            return results

        local_sets = evaluate_features(local_data)
        global_sets = evaluate_features(global_data)
        
        local_total = len(local_data)
        global_total = len(global_data)

        computed_correlations = []

        if local_total > 0 and global_total > 0:
            for i, f1 in enumerate(FEATURE_DEFINITIONS):
                for j, f2 in enumerate(FEATURE_DEFINITIONS):
                    if i == j: continue
                    
                    c_cohort = len(local_sets[f1["id"]])
                    if c_cohort < max(2, int(local_total * 0.05)): 
                        continue
                        
                    c_count = len(local_sets[f1["id"]].intersection(local_sets[f2["id"]]))
                    c_rate = round((c_count / c_cohort) * 100, 1)

                    nat_cohort = len(global_sets[f1["id"]])
                    if nat_cohort > 0:
                        nat_count = len(global_sets[f1["id"]].intersection(global_sets[f2["id"]]))
                        c_nat_rate = round((nat_count / nat_cohort) * 100, 1)
                    else:
                        c_nat_rate = 0.0

                    deviation = round(c_rate - c_nat_rate, 1)

                    computed_correlations.append({
                        "id": f'{f1["id"]}_X_{f2["id"]}',
                        "title": f'{f1["label"]} & {f2["label"]}',
                        "description": f"Pourcentage d'élèves déclarant: [{f2['label']}] parmi ceux qui sont classés comme: [{f1['label']}].",
                        "condition_label": f1["label"],
                        "outcome_label": f2["label"],
                        "cohort_size": c_cohort,
                        "correlation_size": c_count,
                        "rate": c_rate,
                        "national_rate": c_nat_rate,
                        "deviation": deviation
                    })

            # Sort by deviation and rate
            computed_correlations.sort(key=lambda x: (x["deviation"], x["rate"]), reverse=True)

            # Deduplicate bidirectional pairs
            seen_pairs = set()
            top_correlations = []
            for c in computed_correlations:
                parts = frozenset(c["id"].split('_X_'))
                if parts not in seen_pairs:
                    seen_pairs.add(parts)
                    top_correlations.append(c)
                    if len(top_correlations) == 4:
                        break
        else:
            top_correlations = []

        data = {
            "scope_label": scope_label,
            "scope_type": scope_type,
            "total_submissions": sessions.count(),
            "correlations": top_correlations
        }
        return Response(data)

class InsightsView(views.APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        if request.user.role not in ['GLOBAL_ADMIN', 'SUPER_ADMIN']:
            return Response({"detail": "Not authorized"}, status=403)
        data = SentinelleAnalytics.get_advanced_insights()
        return Response(data)

class RegionalProfileView(views.APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request, gov_name):
        data = SentinelleAnalytics.get_regional_profile(gov_name)
        if not data:
            return Response({"detail": "Aucune donnée pour cette région"}, status=404)
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

            # Always generate a new raw token and store only its HMAC-SHA256 hash in the DB
            token = secrets.token_urlsafe(32)
            expiration = timezone.now() + timedelta(hours=24)

            hashed = hmac.new(settings.SECRET_KEY.encode(), token.encode(), hashlib.sha256).hexdigest()

            existing_user = User.objects.filter(email=email).first()
            if existing_user:
                if existing_user.is_active:
                    return Response({"email": ["user with this email address already exists."]}, status=400)

                existing_user.invite_token = hashed
                existing_user.token_expiration = expiration
                existing_user.status = 'PENDING'
                existing_user.is_active = False
                existing_user.created_by = request.user
                if not existing_user.username:
                    existing_user.username = username
                existing_user.save()
                user = existing_user
            else:
                user = serializer.save(
                    username=username,
                    status='PENDING',
                    invite_token=hashed,
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
                # Send multipart email (plain text + HTML) and include helpful headers
                from_email = f"Sentinelle <{settings.DEFAULT_FROM_EMAIL}>"
                html_body = (
                    f"<p>Cher(e) {username},</p>"
                    "<p>Vous avez été officiellement invité(e) à rejoindre la plateforme Sentinelle (MedSPAD Tunisie 2026)." 
                    "Ce portail sécurisé vous permet de contribuer à la veille sanitaire nationale.</p>"
                    f"<p>Veuillez cliquer sur le lien suivant pour configurer votre mot de passe et activer votre compte :</p>"
                    f"<p><a href=\"{invitation_link}\">{invitation_link}</a></p>"
                    "<p>Ce lien est personnel et expirera dans 24 heures.</p>"
                    "<p>Cordialement,<br/>L'équipe d'administration Sentinelle</p>"
                )

                msg = EmailMultiAlternatives(
                    subject=email_subject,
                    body=email_body,
                    from_email=from_email,
                    to=[email],
                    headers={
                        'List-Unsubscribe': f"<mailto:{settings.DEFAULT_FROM_EMAIL}?subject=unsubscribe>",
                    }
                )
                msg.attach_alternative(html_body, "text/html")
                # Add Reply-To to a monitored address if desired
                if getattr(settings, 'EMAIL_REPLY_TO', None):
                    msg.extra_headers = msg.extra_headers or {}
                    msg.extra_headers['Reply-To'] = settings.EMAIL_REPLY_TO

                msg.send(fail_silently=False)
            except Exception as e:
                logging.error(f"Erreur d'envoi d'email : {e}")
                return Response({
                    "detail": "Impossible d'envoyer l'invitation par email. Vérifiez la configuration SMTP.",
                    "error": str(e)
                }, status=500)

            # Log the invitation
            client_ip = request.META.get('REMOTE_ADDR')
            AuditLog.objects.create(
                user=request.user,
                action=f"INVITED_USER: {user.email} (Role: {user.role})",
                ip_address=client_ip
            )

            # In a real app, send email here. Return the link (token plaintext for client)
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

            # Hash the provided token using the same HMAC and compare to stored hash
            hashed = hmac.new(settings.SECRET_KEY.encode(), token.encode(), hashlib.sha256).hexdigest()
            user = User.objects.filter(invite_token=hashed).first()
            
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

    def create(self, request, *args, **kwargs):
        code = request.data.get('code')
        if code and DynamicQuestion.objects.filter(code=code).exists():
            instance = DynamicQuestion.objects.get(code=code)
            serializer = self.get_serializer(instance, data=request.data, partial=True)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return super().create(request, *args, **kwargs)

class DynamicQuestionDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = DynamicQuestion.objects.all()
    serializer_class = serializers.DynamicQuestionSerializer
    permission_classes = (IsSuperAdmin,)
    lookup_field = 'code'

    def update(self, request, *args, **kwargs):
        code = self.kwargs.get('code')
        instance = DynamicQuestion.objects.filter(code=code).first()
        if not instance:
            data = request.data.copy()
            data['code'] = code
            serializer = self.get_serializer(data=data)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return super().update(request, *args, **kwargs)


class DynamicClassReportFieldListView(generics.ListCreateAPIView):
    queryset = DynamicClassReportField.objects.all().order_by('section', 'order')
    serializer_class = serializers.DynamicClassReportFieldSerializer
    permission_classes = (permissions.AllowAny,)

    def get_queryset(self):
        # Auto-seed default fields if none exist
        if DynamicClassReportField.objects.count() == 0:
            defaults = [
                # Identity section
                ('governorate', 'identity', 'Gouvernorat', 'الولاية', 'SELECT', [], 10, False),
                ('establishment_name', 'identity', "Nom de l'établissement", 'اسم المؤسسة', 'TEXT', [], 20, False),
                ('establishment_type', 'identity', "Type d'établissement", 'نوع المؤسسة', 'RADIO', [['PUBLIC', 'Public', 'عمومية'], ['PRIVATE', 'Privé', 'خاصة']], 30, False),
                ('study_level', 'identity', "Niveau d'études", 'المستوى الدراسي', 'RADIO', [['1_AS', '1ère AS', 'السنة الأولى'], ['2_AS', '2ème AS', 'السنة الثانية']], 40, False),
                ('report_date', 'identity', "Date de l'enquête", 'تاريخ المسح', 'TEXT', [], 50, False),
                # Stats section
                ('students_present', 'stats', 'Élèves présents', 'عدد التلاميذ الحاضرين', 'NUMBER', [], 10, False),
                ('students_refused', 'stats', 'Élèves ayant refusé', 'عدد التلاميذ الرافضين', 'NUMBER', [], 20, False),
                ('students_absent', 'stats', 'Élèves absents', 'عدد التلاميذ الغائبين', 'NUMBER', [], 30, False),
                ('parental_authorization_required', 'stats', 'Autorisation parentale demandée ?', 'هل طُلبت موافقة الأولياء؟', 'RADIO', [['true', 'Oui', 'نعم'], ['false', 'Non', 'لا']], 40, False),
                ('students_without_authorization', 'stats', 'Élèves sans autorisation', 'تلاميذ بدون موافقة', 'NUMBER', [], 50, False),
                ('questionnaires_collected', 'stats', 'Questionnaires collectés', 'الاستبيانات التي تم جمعها', 'NUMBER', [], 60, False),
                # Observations section
                ('perturbations', 'observations', 'Perturbations remarquées', 'الاضطرابات الملاحظة', 'RADIO', [['1', 'Aucune', 'لا يوجد'], ['2', 'Quelques élèves', 'بعض التلاميذ'], ['3', 'Plusieurs élèves', 'تلاميذ كثر']], 10, False),
                ('serious_work', 'observations', 'Sérieux des élèves', 'جدية التلاميذ', 'RADIO', [['1', 'Tous', 'الجميع'], ['2', 'La majorité', 'الأغلبية'], ['3', 'Moitié ou moins', 'النصف أو أقل']], 20, False),
                ('difficulty_level', 'observations', 'Facilité de réponse', 'سهولة الإجابة', 'RADIO', [['1', 'Facile', 'سهل'], ['2', 'Moyen', 'متوسط'], ['3', 'Difficile', 'صعب']], 30, False),
                # Timing section
                ('planned_time_minutes', 'timing', 'Temps prévu (min)', 'الوقت المقرر (دقائق)', 'NUMBER', [], 10, False),
                ('first_student_time_minutes', 'timing', 'Temps premier élève (min)', 'وقت أول تلميذ (دقائق)', 'NUMBER', [], 20, False),
                ('last_student_time_minutes', 'timing', 'Temps dernier élève (min)', 'وقت آخر تلميذ (دقائق)', 'NUMBER', [], 30, False),
                # Comments section
                ('personal_comments', 'comments', 'Remarques et incidents', 'ملاحظات وحوادث', 'TEXTAREA', [], 10, False),
            ]
            for code, sec, fr, ar, ftype, opts, ord_num, is_cust in defaults:
                DynamicClassReportField.objects.create(
                    code=code, section=sec, label_fr=fr, label_ar=ar,
                    field_type=ftype, options_json=opts, order=ord_num, is_custom=is_cust
                )
        return DynamicClassReportField.objects.all().order_by('section', 'order')

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsSuperAdmin()]
        return [permissions.AllowAny()]


class DynamicClassReportFieldDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = DynamicClassReportField.objects.all()
    serializer_class = serializers.DynamicClassReportFieldSerializer
    permission_classes = (IsSuperAdmin,)
    lookup_field = 'code'


# ─── Class Report Views ─────────────────────────────────────────────────────────

class ClassReportCreateView(generics.CreateAPIView):
    queryset = ClassReport.objects.all()
    serializer_class = serializers.ClassReportSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def create(self, request, *args, **kwargs):
        role = getattr(request.user, 'role', '').upper()
        if role in ['GLOBAL_ADMIN', 'REGIONAL_ADMIN']:
            return Response({"detail": "Les administrateurs globaux et régionaux ont un accès en consultation seule."}, status=403)
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class LatestActiveReportView(views.APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        user = request.user
        role = getattr(user, 'role', '').upper()
        is_super = role in ['SUPER_ADMIN', 'SUPERADMIN', 'GLOBAL_ADMIN'] or user.is_staff or user.is_superuser
        report_id = request.query_params.get('id')

        if report_id:
            if is_super:
                report = ClassReport.objects.filter(pk=report_id).first()
            elif role == 'REGIONAL_ADMIN':
                report = ClassReport.objects.filter(pk=report_id, governorate=user.governorate).first()
            else:
                report = ClassReport.objects.filter(pk=report_id, created_by=user).first()
            if not report:
                return Response({"detail": "Report not found"}, status=404)
            return Response(serializers.ClassReportSerializer(report).data)

        # Get the latest NON-FINALIZED report
        if role in ['SUPER_ADMIN', 'SUPERADMIN', 'GLOBAL_ADMIN']:
            user_report = ClassReport.objects.filter(is_finalized=False).order_by('-created_at').first()
        elif role == 'REGIONAL_ADMIN':
            user_report = ClassReport.objects.filter(is_finalized=False, governorate=user.governorate).order_by('-created_at').first()
        else:
            user_report = ClassReport.objects.filter(is_finalized=False, created_by=user).order_by('-created_at').first()

        if user_report:
            return Response(serializers.ClassReportSerializer(user_report).data)
            
        return Response(None, status=200)

class ClassReportListView(generics.ListAPIView):
    serializer_class = serializers.ClassReportSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        user = self.request.user
        role = getattr(user, 'role', '').upper()
        target_user_id = self.request.query_params.get('user_id') or self.request.query_params.get('user')

        if role in ['SUPER_ADMIN', 'SUPERADMIN'] or user.is_staff or user.is_superuser:
            if target_user_id:
                qs = ClassReport.objects.filter(created_by_id=target_user_id)
            elif self.request.query_params.get('all') == 'true':
                qs = ClassReport.objects.all()
            else:
                qs = ClassReport.objects.filter(created_by=user)
        elif role == 'GLOBAL_ADMIN':
            # Global admin sees all reports across all regions
            qs = ClassReport.objects.all()
        elif role == 'REGIONAL_ADMIN':
            # Regional admin sees all reports of their region
            if getattr(user, 'governorate', None):
                qs = ClassReport.objects.filter(governorate=user.governorate)
            else:
                qs = ClassReport.objects.all()
        else:
            # Practitioner or Operator: strictly their own reports
            qs = ClassReport.objects.filter(created_by=user)

        qs = qs.select_related('governorate', 'establishment').prefetch_related('submissions')
        
        # Filter by finalized status if specified
        is_finalized = self.request.query_params.get('is_finalized')
        if is_finalized is not None:
            if is_finalized.lower() in ['true', '1']:
                qs = qs.filter(is_finalized=True)
            elif is_finalized.lower() in ['false', '0']:
                qs = qs.filter(is_finalized=False)
                
        gov_id = self.request.query_params.get('governorate')
        if gov_id:
            qs = qs.filter(governorate_id=gov_id)
            
        return qs.order_by('-created_at')

class ClassReportDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = serializers.ClassReportSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        user = self.request.user
        role = getattr(user, 'role', '').upper()
        if role in ['SUPER_ADMIN', 'SUPERADMIN', 'GLOBAL_ADMIN'] or user.is_staff or user.is_superuser:
            return ClassReport.objects.all().select_related('governorate', 'establishment')
        elif role == 'REGIONAL_ADMIN':
            if getattr(user, 'governorate', None):
                return ClassReport.objects.filter(governorate=user.governorate).select_related('governorate', 'establishment')
            return ClassReport.objects.none()
        return ClassReport.objects.filter(created_by=user).select_related('governorate', 'establishment')

    def update(self, request, *args, **kwargs):
        role = getattr(request.user, 'role', '').upper()
        if role in ['GLOBAL_ADMIN', 'REGIONAL_ADMIN']:
            return Response({"detail": "Les administrateurs globaux et régionaux ont un accès en consultation seule."}, status=403)
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        role = getattr(request.user, 'role', '').upper()
        if role in ['GLOBAL_ADMIN', 'REGIONAL_ADMIN']:
            return Response({"detail": "Les administrateurs globaux et régionaux ont un accès en consultation seule."}, status=403)
        instance = self.get_object()
        # Delete all attached questionnaire submissions so indicators update immediately
        instance.submissions.all().delete()
        return super().destroy(request, *args, **kwargs)

class ClassReportFinalizeView(views.APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, pk):
        user = request.user
        role = getattr(user, 'role', '').upper()
        if role in ['GLOBAL_ADMIN', 'REGIONAL_ADMIN']:
            return Response({"detail": "Les administrateurs globaux et régionaux ont un accès en consultation seule."}, status=403)

        is_super = role in ['SUPER_ADMIN', 'SUPERADMIN'] or user.is_staff or user.is_superuser

        if is_super:
            report = ClassReport.objects.filter(pk=pk).first()
        else:
            report = ClassReport.objects.filter(pk=pk, created_by=user).first()

        if not report:
            return Response({"detail": "Report not found."}, status=404)
        
        action = request.data.get('action') or request.query_params.get('action')
        if action == 'unfinalize' or request.data.get('is_finalized') is False:
            report.is_finalized = False
        else:
            report.is_finalized = True
        report.save()
        
        # Log the action
        from .models import AuditLog
        AuditLog.objects.create(
            user=request.user,
            action=f"{'FINALIZED' if report.is_finalized else 'REOPENED'}_CLASS_REPORT: {report.id} ({report.establishment_name})",
            ip_address=request.META.get('REMOTE_ADDR')
        )
        
        return Response({"status": "finalized" if report.is_finalized else "reopened", "id": report.id, "is_finalized": report.is_finalized})


