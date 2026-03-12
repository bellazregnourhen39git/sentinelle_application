from rest_framework import generics, permissions, status, views
from rest_framework.response import Response
from django.db.models import Count, Q
from django.contrib.auth import get_user_model
from .models import Governorate, SchoolEstablishment, SchoolClass, MedSPADQuestionnaireResponse
from .serializers import (
    RegisterSerializer, UserSerializer, GovernorateSerializer,
    SchoolEstablishmentSerializer, SchoolClassSerializer,
    MedSPADQuestionnaireResponseSerializer
)

User = get_user_model()

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

class ProfileView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self):
        return self.request.user


class QuestionnaireSubmitView(generics.CreateAPIView):
    serializer_class = MedSPADQuestionnaireResponseSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def perform_create(self, serializer):
        # Additional logic can be added here, e.g. deriving flags from the raw JSON answers
        # For prototype, we expect the frontend to pass the boolean flags based on the answers too,
        # or we could parse `serializer.validated_data['answers']` here to set them.
        serializer.save()


# --- DASHBOARDS AND STATS REST APIs ---

class SchoolStatsView(views.APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        user = request.user
        if user.role != 'USER' or not user.establishment:
            return Response({"detail": "Not authorized or missing establishment."}, status=403)
        
        # Get stats for the specific establishment
        responses = MedSPADQuestionnaireResponse.objects.filter(school=user.establishment)
        total = responses.count()
        
        stats = {
            "total_responses": total,
            "tobacco_users": responses.filter(tobacco_user=True).count(),
            "alcohol_users": responses.filter(alcohol_user=True).count(),
            "cannabis_users": responses.filter(cannabis_user=True).count(),
            "cocaine_users": responses.filter(cocaine_user=True).count(),
            "ecstasy_users": responses.filter(ecstasy_user=True).count(),
            "has_risk_behavior": responses.filter(has_risk_behavior=True).count(),
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

        responses = MedSPADQuestionnaireResponse.objects.filter(governorate_id=gov_id)
        
        # Aggregate by establishment
        by_school = responses.values('school__name').annotate(
            total=Count('id'),
            tobacco=Count('id', filter=Q(tobacco_user=True)),
            alcohol=Count('id', filter=Q(alcohol_user=True)),
            cannabis=Count('id', filter=Q(cannabis_user=True))
        )

        stats = {
            "total_responses": responses.count(),
            "by_school": list(by_school)
        }
        return Response(stats)

class NationalStatsView(views.APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get(self, request):
        user = request.user
        if user.role != 'SUPERADMIN':
            return Response({"detail": "Not authorized."}, status=403)
        
        responses = MedSPADQuestionnaireResponse.objects.all()

        by_gov = responses.values('governorate__name').annotate(
            total=Count('id'),
            tobacco=Count('id', filter=Q(tobacco_user=True)),
            alcohol=Count('id', filter=Q(alcohol_user=True)),
            cannabis=Count('id', filter=Q(cannabis_user=True)),
        )

        stats = {
            "total_national_responses": responses.count(),
            "by_governorate": list(by_gov)
        }
        return Response(stats)

# --- SIDRA Integration APIs ---
class SidraDataExportView(generics.ListAPIView):
    """
    Endpoint for the external SIDRA platform to retrieve statistics safely.
    It returns aggregated data rather than personal sensitive form responses.
    """
    permission_classes = (permissions.IsAuthenticated,) # Should use specific API tokens in prod
    
    def get(self, request):
        # Example API: Returning full aggregated counts across the country
        responses = MedSPADQuestionnaireResponse.objects.all()
        data = {
            "survey_source": "MedSPAD_Sentinelle",
            "total_entries": responses.count(),
            "prevalence_indicators": {
                "tobacco": responses.filter(tobacco_user=True).count(),
                "alcohol": responses.filter(alcohol_user=True).count(),
                "cannabis": responses.filter(cannabis_user=True).count(),
                "cocaine": responses.filter(cocaine_user=True).count(),
                "ecstasy": responses.filter(ecstasy_user=True).count()
            }
        }
        return Response(data)
