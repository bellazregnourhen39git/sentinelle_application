from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Governorate, SchoolEstablishment, SchoolClass, MedSPADQuestionnaireResponse

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role', 'establishment', 'governorate')

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    establishment = serializers.PrimaryKeyRelatedField(queryset=SchoolEstablishment.objects.all(), required=False, allow_null=True)
    governorate = serializers.PrimaryKeyRelatedField(queryset=Governorate.objects.all(), required=False, allow_null=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'role', 'establishment', 'governorate')

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
            role=validated_data.get('role', 'USER'),
            establishment=validated_data.get('establishment', None),
            governorate=validated_data.get('governorate', None)
        )
        return user

class GovernorateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Governorate
        fields = '__all__'

class SchoolEstablishmentSerializer(serializers.ModelSerializer):
    governorate_name = serializers.CharField(source='governorate.name', read_only=True)
    
    class Meta:
        model = SchoolEstablishment
        fields = '__all__'

class SchoolClassSerializer(serializers.ModelSerializer):
    establishment_name = serializers.CharField(source='establishment.name', read_only=True)
    
    class Meta:
        model = SchoolClass
        fields = '__all__'

class MedSPADQuestionnaireResponseSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedSPADQuestionnaireResponse
        fields = '__all__'
