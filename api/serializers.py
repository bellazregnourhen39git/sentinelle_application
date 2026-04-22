from django.contrib.auth import get_user_model, authenticate
from django.db.models import Q
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.utils import timezone
from .models import (
    Governorate, SchoolEstablishment, SchoolClass,
    QuestionnaireSession,
    SectionA, SectionB, SectionC, SectionD, SectionE,
    SectionG, SectionH, SectionI, SectionJ, SectionK,
    SectionL, SectionM, SectionN, SectionP, SectionQ,
    SectionL, SectionM, SectionN, SectionP, SectionQ,
    SectionR, SectionS, SectionT, SectionU, SectionV, SectionZ,
    PlatformTerminology, DynamicQuestion
)

User = get_user_model()


# ─── Auth Serializers ────────────────────────────────────────────────────────────

class UserSerializer(serializers.ModelSerializer):
    governorate_name = serializers.CharField(source='governorate.name', read_only=True, default=None)
    establishment_name = serializers.CharField(source='establishment.name', read_only=True, default=None)

    class Meta:
        model = User
        fields = (
            'id', 'username', 'email', 'role', 'status', 'organization_type',
            'establishment', 'establishment_name', 'governorate', 'governorate_name',
            'phone_number', 'created_by'
        )
        read_only_fields = ('id', 'status', 'created_by')


class InviteUserSerializer(serializers.ModelSerializer):
    username = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ('email', 'username', 'role', 'organization_type', 'governorate', 'establishment')

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Cet utilisateur est déjà enregistré dans le système.")
        return value



class SecureTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        email = attrs.get('email') or attrs.get('username')
        user = User.objects.filter(Q(email=email) | Q(username=email)).first()

        if user:
            if user.status == 'DISABLED':
                raise serializers.ValidationError({"detail": "Votre compte est bloqué suite à trop de tentatives. Contactez un administrateur."})
            
            # SimpleJWT uses username for auth, but we allow email
            # We must pass the correct username to Super.validate
            attrs['username'] = user.username

        try:
            data = super().validate(attrs)
            # Reset on success
            if user:
                user.failed_attempts = 0
                user.last_login_attempt = timezone.now()
                user.save()
            return data
        except Exception as e:
            if user:
                user.failed_attempts += 1
                user.last_login_attempt = timezone.now()
                if user.failed_attempts >= 5:
                    user.status = 'DISABLED'
                user.save()
            raise e


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    establishment = serializers.PrimaryKeyRelatedField(
        queryset=SchoolEstablishment.objects.all(), required=False, allow_null=True)
    governorate = serializers.PrimaryKeyRelatedField(
        queryset=Governorate.objects.all(), required=False, allow_null=True)

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'password', 'role', 'establishment', 'governorate', 'phone_number')

    def create(self, validated_data):
        return User.objects.create_user(
            username=validated_data.get('username', validated_data['email'].split('@')[0]),
            email=validated_data['email'],
            password=validated_data['password'],
            role=validated_data.get('role', 'PRACTITIONER'),
            establishment=validated_data.get('establishment', None),
            governorate=validated_data.get('governorate', None),
            phone_number=validated_data.get('phone_number', None),
            is_active=True,
            approval_status='APPROVED'
        )


# ─── Location Serializers ────────────────────────────────────────────────────────

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


class DynamicQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = DynamicQuestion
        fields = '__all__'


# ─── Section Serializers ─────────────────────────────────────────────────────────

class SectionASerializer(serializers.ModelSerializer):
    class Meta:
        model = SectionA
        exclude = ('session',)


class SectionBSerializer(serializers.ModelSerializer):
    class Meta:
        model = SectionB
        exclude = ('session',)


class SectionCSerializer(serializers.ModelSerializer):
    class Meta:
        model = SectionC
        exclude = ('session',)


class SectionDSerializer(serializers.ModelSerializer):
    class Meta:
        model = SectionD
        exclude = ('session',)


class SectionESerializer(serializers.ModelSerializer):
    class Meta:
        model = SectionE
        exclude = ('session',)


class SectionGSerializer(serializers.ModelSerializer):
    class Meta:
        model = SectionG
        exclude = ('session',)


class SectionHSerializer(serializers.ModelSerializer):
    class Meta:
        model = SectionH
        exclude = ('session',)


class SectionISerializer(serializers.ModelSerializer):
    class Meta:
        model = SectionI
        exclude = ('session',)


class SectionJSerializer(serializers.ModelSerializer):
    class Meta:
        model = SectionJ
        exclude = ('session',)


class SectionKSerializer(serializers.ModelSerializer):
    class Meta:
        model = SectionK
        exclude = ('session',)


class SectionLSerializer(serializers.ModelSerializer):
    class Meta:
        model = SectionL
        exclude = ('session',)


class SectionMSerializer(serializers.ModelSerializer):
    class Meta:
        model = SectionM
        exclude = ('session',)


class SectionNSerializer(serializers.ModelSerializer):
    class Meta:
        model = SectionN
        exclude = ('session',)


class SectionPSerializer(serializers.ModelSerializer):
    class Meta:
        model = SectionP
        exclude = ('session',)


class SectionQSerializer(serializers.ModelSerializer):
    class Meta:
        model = SectionQ
        exclude = ('session',)


class SectionRSerializer(serializers.ModelSerializer):
    class Meta:
        model = SectionR
        exclude = ('session',)


class SectionSSerializer(serializers.ModelSerializer):
    class Meta:
        model = SectionS
        exclude = ('session',)


class SectionTSerializer(serializers.ModelSerializer):
    class Meta:
        model = SectionT
        exclude = ('session',)


class SectionUSerializer(serializers.ModelSerializer):
    class Meta:
        model = SectionU
        exclude = ('session',)


class SectionVSerializer(serializers.ModelSerializer):
    class Meta:
        model = SectionV
        exclude = ('session',)


class SectionZSerializer(serializers.ModelSerializer):
    class Meta:
        model = SectionZ
        exclude = ('session',)


# ─── Master Session Serializer ───────────────────────────────────────────────────

SECTION_MAP = {
    'section_a': SectionASerializer,
    'section_b': SectionBSerializer,
    'section_c': SectionCSerializer,
    'section_d': SectionDSerializer,
    'section_e': SectionESerializer,
    'section_g': SectionGSerializer,
    'section_h': SectionHSerializer,
    'section_i': SectionISerializer,
    'section_j': SectionJSerializer,
    'section_k': SectionKSerializer,
    'section_l': SectionLSerializer,
    'section_m': SectionMSerializer,
    'section_n': SectionNSerializer,
    'section_p': SectionPSerializer,
    'section_q': SectionQSerializer,
    'section_r': SectionRSerializer,
    'section_s': SectionSSerializer,
    'section_t': SectionTSerializer,
    'section_u': SectionUSerializer,
    'section_v': SectionVSerializer,
    'section_z': SectionZSerializer,
}

SECTION_MODEL_MAP = {
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


class QuestionnaireSessionSerializer(serializers.ModelSerializer):
    school = SchoolEstablishmentSerializer(read_only=True)
    governorate = GovernorateSerializer(read_only=True)

    section_a = SectionASerializer(required=True)
    section_b = SectionBSerializer(required=False)
    section_c = SectionCSerializer(required=False)
    section_d = SectionDSerializer(required=False)
    section_e = SectionESerializer(required=False)
    section_g = SectionGSerializer(required=False)
    section_h = SectionHSerializer(required=False)
    section_i = SectionISerializer(required=False)
    section_j = SectionJSerializer(required=False)
    section_k = SectionKSerializer(required=False)
    section_l = SectionLSerializer(required=False)
    section_m = SectionMSerializer(required=False)
    section_n = SectionNSerializer(required=False)
    section_p = SectionPSerializer(required=False)
    section_q = SectionQSerializer(required=False)
    section_r = SectionRSerializer(required=False)
    section_s = SectionSSerializer(required=False)
    section_t = SectionTSerializer(required=False)
    section_u = SectionUSerializer(required=False)
    section_v = SectionVSerializer(required=False)
    section_z = SectionZSerializer(required=False)
    
    extra_answers = serializers.JSONField(required=False, default=dict)

    class Meta:
        model = QuestionnaireSession
        fields = [
            'id', 'school_class', 'school', 'governorate', 'language_used', 'created_at',
            'tobacco_user', 'ecig_user', 'hookah_user', 'alcohol_user', 'tranquilizer_user',
            'cannabis_user', 'cocaine_user', 'ecstasy_user', 'heroin_user', 'inhalant_user',
            'has_risk_behavior', 'is_valid', 'exclusion_reason',
            'section_a', 'section_b', 'section_c', 'section_d', 'section_e',
            'section_g', 'section_h', 'section_i', 'section_j', 'section_k',
            'section_l', 'section_m', 'section_n', 'section_p', 'section_q',
            'section_r', 'section_s', 'section_t', 'section_u', 'section_v', 'section_z',
            'extra_answers'
        ]
        read_only_fields = (
            'id', 'created_at', 'school', 'governorate',
            'tobacco_user', 'ecig_user', 'hookah_user', 'alcohol_user', 'tranquilizer_user',
            'cannabis_user', 'cocaine_user', 'ecstasy_user', 'heroin_user', 'inhalant_user',
            'has_risk_behavior', 'is_valid', 'exclusion_reason',
        )

    def create(self, validated_data):
        from django.db import transaction

        # Derive school and governorate from school_class
        school_class = validated_data.get('school_class')
        if school_class:
            validated_data['school'] = school_class.establishment
            validated_data['governorate'] = school_class.establishment.governorate
        
        # Pop all nested section data
        sections_data = {key: validated_data.pop(key, None) for key in SECTION_MAP}

        with transaction.atomic():
            # Derive computed flags from section data
            section_c = sections_data.get('section_c') or {}
            section_d = sections_data.get('section_d') or {}
            section_e = sections_data.get('section_e') or {}
            section_g = sections_data.get('section_g') or {}
            section_h = sections_data.get('section_h') or {}
            section_i = sections_data.get('section_i') or {}
            section_j = sections_data.get('section_j') or {}
            section_k = sections_data.get('section_k') or {}
            section_l = sections_data.get('section_l') or {}
            section_m = sections_data.get('section_m') or {}

            def used(section_data, field='lifetime_freq'):
                val = section_data.get(field, 'never')
                return val is not None and val != 'never' and val != ''

            tobacco_user = used(section_c)
            ecig_user = used(section_d)
            hookah_user = used(section_e)
            alcohol_user = used(section_g)
            tranquilizer_user = used(section_h)
            cannabis_user = used(section_i)
            cocaine_user = used(section_j)
            ecstasy_user = used(section_k)
            heroin_user = used(section_l)
            inhalant_user = used(section_m)
            has_risk = any([
                tobacco_user, ecig_user, hookah_user, alcohol_user,
                tranquilizer_user, cannabis_user, cocaine_user,
                ecstasy_user, heroin_user, inhalant_user,
            ])
            
            # --- Exclusion Logic ---
            is_valid = True
            exclusion_reasons = []
            
            # 1. Gender non précisé
            # Validate against SectionA gender choices.
            section_a_data = sections_data.get('section_a') or {}
            gender = section_a_data.get('gender')
            if not gender or gender not in ['M', 'F']:
                is_valid = False
                exclusion_reasons.append("Genre non précisé")
                
            # 2. Age < 15 or > 18
            birth_year = section_a_data.get('birth_year')
            if birth_year:
                # Calculating age based on current reference year (e.g. 2026)
                age = 2026 - birth_year
                if age < 15 or age > 18:
                    is_valid = False
                    exclusion_reasons.append(f"Âge hors limites ({age} ans)")
            
            # 3. Taux de valeurs manquantes par questionnaire > 50%
            total_fields = 0
            missing_fields = 0
            
            for sec_key, sec_data in sections_data.items():
                if sec_data:
                    total_fields += len(sec_data.keys())
                    missing_fields += sum(1 for v in sec_data.values() if v in [None, '', [], {}])
            
            if total_fields > 0 and (missing_fields / total_fields) > 0.5:
                is_valid = False
                exclusion_reasons.append(f"Valeurs manquantes > 50% ({missing_fields}/{total_fields})")
            
            # 4. Consommation de substance fictive (Section P / Question piège)
            section_p_data = sections_data.get('section_p') or {}
            fictive_substance = section_p_data.get('fictive_substance_consumption')
            if fictive_substance == 'yes':
                is_valid = False
                exclusion_reasons.append("Consommation de substance fictive déclarée (Question piège)")

            session = QuestionnaireSession.objects.create(
                **validated_data,
                tobacco_user=tobacco_user,
                ecig_user=ecig_user,
                hookah_user=hookah_user,
                alcohol_user=alcohol_user,
                tranquilizer_user=tranquilizer_user,
                cannabis_user=cannabis_user,
                cocaine_user=cocaine_user,
                ecstasy_user=ecstasy_user,
                heroin_user=heroin_user,
                inhalant_user=inhalant_user,
                has_risk_behavior=has_risk,
                is_valid=is_valid,
                exclusion_reason=" | ".join(exclusion_reasons) if not is_valid else None,
                extra_answers=validated_data.get('extra_answers', {})
            )

            # Create each section record
            for section_key, section_data in sections_data.items():
                if section_data:
                    SECTION_MODEL_MAP[section_key].objects.create(session=session, **section_data)

        return session


class PlatformTerminologySerializer(serializers.ModelSerializer):
    class Meta:
        model = PlatformTerminology
        fields = '__all__'
