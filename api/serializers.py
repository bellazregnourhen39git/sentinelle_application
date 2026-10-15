from django.contrib.auth import get_user_model, authenticate
from django.db.models import Q
from datetime import timedelta
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from django.utils import timezone
from .models import (
    Governorate, SchoolEstablishment, SchoolClass,
    QuestionnaireSession,
    SectionA, SectionB, SectionC, SectionD, SectionE,
    SectionG, SectionH, SectionI, SectionJ, SectionK,
    SectionL, SectionM, SectionN, SectionP, SectionQ,
    SectionR, SectionS, SectionT, SectionU, SectionV, SectionZ,
    PlatformTerminology, DynamicQuestion, ClassReport, DynamicClassReportField
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


class ActivateUserSerializer(serializers.Serializer):
    token = serializers.CharField()
    password = serializers.CharField(min_length=8)



class SecureTokenObtainPairSerializer(serializers.Serializer):
    username = serializers.CharField(required=False, allow_blank=True, write_only=True)
    email = serializers.EmailField(required=False, allow_blank=True, write_only=True)
    password = serializers.CharField(trim_whitespace=False, write_only=True)
    access = serializers.CharField(read_only=True)
    refresh = serializers.CharField(read_only=True)

    def validate(self, attrs):
        identifier = attrs.get('email') or attrs.get('username')
        password = attrs.get('password')
        if not identifier or not password:
            raise serializers.ValidationError({"detail": "Veuillez fournir un email ou un nom d'utilisateur et un mot de passe."})

        user = User.objects.filter(Q(email=identifier) | Q(username=identifier)).first()

        if not user:
            raise serializers.ValidationError({"detail": "Cet utilisateur n'existe pas."})

        lockout_duration = timedelta(minutes=30)
        if user.status == 'DISABLED' and user.last_login_attempt:
            if timezone.now() - user.last_login_attempt > lockout_duration:
                user.status = 'ACTIVE'
                user.failed_attempts = 0
                user.save()

        if user.status == 'DISABLED':
            raise serializers.ValidationError({"detail": "Votre compte est bloqué suite à trop de tentatives. Contactez un administrateur."})

        authenticated_user = authenticate(**{User.USERNAME_FIELD: user.email}, password=password)

        if not authenticated_user:
            user.failed_attempts += 1
            user.last_login_attempt = timezone.now()
            if user.failed_attempts >= 5:
                user.status = 'DISABLED'
            user.save()
            raise serializers.ValidationError({"detail": "Mot de passe incorrect."})

        user.failed_attempts = 0
        user.last_login_attempt = timezone.now()
        user.save()

        refresh = RefreshToken.for_user(authenticated_user)
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }


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


class DynamicClassReportFieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = DynamicClassReportField
        fields = '__all__'


class ClassReportSerializer(serializers.ModelSerializer):
    governorate_name = serializers.CharField(source='governorate.name', read_only=True)
    submissions_count = serializers.IntegerField(source='submissions.count', read_only=True)
    governorate = serializers.PrimaryKeyRelatedField(queryset=Governorate.objects.all(), required=False, allow_null=True)
    establishment = serializers.PrimaryKeyRelatedField(queryset=SchoolEstablishment.objects.all(), required=False, allow_null=True)

    class Meta:
        model = ClassReport
        fields = '__all__'

    def validate(self, attrs):
        user = self.context['request'].user if 'request' in self.context else None
        
        # If governorate is not provided in payload, fallback to user's governorate
        if not attrs.get('governorate') and user and getattr(user, 'governorate', None):
            attrs['governorate'] = user.governorate
            
        # If still no governorate and establishment is given, infer from establishment
        if not attrs.get('governorate') and attrs.get('establishment') and attrs['establishment'].governorate:
            attrs['governorate'] = attrs['establishment'].governorate

        if not attrs.get('governorate') and not self.instance:
            raise serializers.ValidationError({"governorate": "Le gouvernorat est requis."})

        # Auto-fill establishment name if not given
        if attrs.get('establishment') and not attrs.get('establishment_name'):
            attrs['establishment_name'] = attrs['establishment'].name

        # Auto-resolve or create SchoolEstablishment if establishment_name is provided
        if not attrs.get('establishment') and attrs.get('establishment_name') and attrs.get('governorate'):
            name = attrs['establishment_name'].strip()
            if name:
                est = SchoolEstablishment.objects.filter(name__iexact=name, governorate=attrs['governorate']).first()
                if not est:
                    est = SchoolEstablishment.objects.create(name=name, governorate=attrs['governorate'])
                attrs['establishment'] = est

        return attrs

    def create(self, validated_data):
        user = self.context['request'].user if 'request' in self.context else None
        if user and user.is_authenticated:
            validated_data['created_by'] = user
        return super().create(validated_data)


# ─── Section Serializers ─────────────────────────────────────────────────────────

class DynamicSectionModelSerializer(serializers.ModelSerializer):
    """
    Custom ModelSerializer that relaxes static ChoiceField validation
    to allow dynamic questionnaire options and custom administrator choices.
    """
    def build_standard_field(self, field_name, model_field):
        field_class, field_kwargs = super().build_standard_field(field_name, model_field)
        if field_class == serializers.ChoiceField:
            field_class = serializers.CharField
            field_kwargs.pop('choices', None)
            field_kwargs['allow_blank'] = True
            field_kwargs['allow_null'] = True
            field_kwargs['required'] = False
        return field_class, field_kwargs


class SectionASerializer(DynamicSectionModelSerializer):
    class Meta:
        model = SectionA
        exclude = ('session',)


class SectionBSerializer(DynamicSectionModelSerializer):
    class Meta:
        model = SectionB
        exclude = ('session',)


class SectionCSerializer(DynamicSectionModelSerializer):
    class Meta:
        model = SectionC
        exclude = ('session',)


class SectionDSerializer(DynamicSectionModelSerializer):
    class Meta:
        model = SectionD
        exclude = ('session',)


class SectionESerializer(DynamicSectionModelSerializer):
    class Meta:
        model = SectionE
        exclude = ('session',)


class SectionGSerializer(DynamicSectionModelSerializer):
    class Meta:
        model = SectionG
        exclude = ('session',)


class SectionHSerializer(DynamicSectionModelSerializer):
    class Meta:
        model = SectionH
        exclude = ('session',)


class SectionISerializer(DynamicSectionModelSerializer):
    class Meta:
        model = SectionI
        exclude = ('session',)


class SectionJSerializer(DynamicSectionModelSerializer):
    class Meta:
        model = SectionJ
        exclude = ('session',)


class SectionKSerializer(DynamicSectionModelSerializer):
    class Meta:
        model = SectionK
        exclude = ('session',)


class SectionLSerializer(DynamicSectionModelSerializer):
    class Meta:
        model = SectionL
        exclude = ('session',)


class SectionMSerializer(DynamicSectionModelSerializer):
    class Meta:
        model = SectionM
        exclude = ('session',)


class SectionNSerializer(DynamicSectionModelSerializer):
    class Meta:
        model = SectionN
        exclude = ('session',)


class SectionPSerializer(DynamicSectionModelSerializer):
    class Meta:
        model = SectionP
        exclude = ('session',)


class SectionQSerializer(DynamicSectionModelSerializer):
    class Meta:
        model = SectionQ
        exclude = ('session',)


class SectionRSerializer(DynamicSectionModelSerializer):
    class Meta:
        model = SectionR
        exclude = ('session',)


class SectionSSerializer(DynamicSectionModelSerializer):
    class Meta:
        model = SectionS
        exclude = ('session',)


class SectionTSerializer(DynamicSectionModelSerializer):
    class Meta:
        model = SectionT
        exclude = ('session',)


class SectionUSerializer(DynamicSectionModelSerializer):
    class Meta:
        model = SectionU
        exclude = ('session',)


class SectionVSerializer(DynamicSectionModelSerializer):
    class Meta:
        model = SectionV
        exclude = ('session',)


class SectionZSerializer(DynamicSectionModelSerializer):
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

class QuestionnaireSessionListSerializer(serializers.ModelSerializer):
    school_name = serializers.CharField(source='school.name', read_only=True)
    governorate_name = serializers.CharField(source='governorate.name', read_only=True)
    section_a = SectionASerializer(read_only=True)

    class Meta:
        model = QuestionnaireSession
        fields = [
            'id', 'school_name', 'governorate_name', 'language_used', 
            'created_at', 'is_valid', 'exclusion_reason', 'has_risk_behavior',
            'section_a'
        ]


class QuestionnaireSessionSerializer(serializers.ModelSerializer):
    school = SchoolEstablishmentSerializer(read_only=True)
    governorate = GovernorateSerializer(read_only=True)
    school_id = serializers.PrimaryKeyRelatedField(
        queryset=SchoolEstablishment.objects.all(),
        source='school',
        write_only=True,
        required=False,
    )
    governorate_id = serializers.PrimaryKeyRelatedField(
        queryset=Governorate.objects.all(),
        source='governorate',
        write_only=True,
        required=False,
    )
    establishment = serializers.PrimaryKeyRelatedField(
        queryset=SchoolEstablishment.objects.all(),
        source='school',
        write_only=True,
        required=False,
        allow_null=True,
    )

    section_a = SectionASerializer(required=False)
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
    answers = serializers.JSONField(required=False, write_only=True, allow_null=True)

    def validate(self, validated_data):
        initial_data = self.initial_data or {}

        school_class = validated_data.get('school_class')
        class_report = validated_data.get('class_report')

        if class_report:
            if not class_report.establishment and class_report.establishment_name and class_report.governorate:
                name = class_report.establishment_name.strip()
                if name:
                    est = SchoolEstablishment.objects.filter(name__iexact=name, governorate=class_report.governorate).first()
                    if not est:
                        est = SchoolEstablishment.objects.create(name=name, governorate=class_report.governorate)
                    class_report.establishment = est
                    class_report.save(update_fields=['establishment'])

            if class_report.establishment:
                validated_data['school'] = class_report.establishment
            if class_report.governorate:
                validated_data['governorate'] = class_report.governorate
        elif school_class:
            validated_data['school'] = school_class.establishment
            if school_class.establishment and school_class.establishment.governorate:
                validated_data['governorate'] = school_class.establishment.governorate
        else:
            if 'school' not in validated_data:
                if initial_data.get('school_id') is not None:
                    validated_data['school'] = SchoolEstablishment.objects.filter(pk=initial_data['school_id']).first()
                elif initial_data.get('establishment') is not None:
                    validated_data['school'] = SchoolEstablishment.objects.filter(pk=initial_data['establishment']).first()

            if 'governorate' not in validated_data:
                governorate_value = initial_data.get('governorate_id') or initial_data.get('governorate')
                if governorate_value is not None:
                    validated_data['governorate'] = Governorate.objects.filter(pk=governorate_value).first()

        school = validated_data.get('school')
        governorate = validated_data.get('governorate')

        if school and not governorate and school.governorate:
            validated_data['governorate'] = school.governorate

        if 'answers' in initial_data and 'extra_answers' not in validated_data:
            validated_data['extra_answers'] = initial_data.get('answers', {})

        request = self.context.get('request')
        user = getattr(request, 'user', None) if request else None

        if not validated_data.get('school'):
            if user and getattr(user, 'establishment', None):
                validated_data['school'] = user.establishment
            else:
                validated_data['school'] = SchoolEstablishment.objects.first()

        if not validated_data.get('governorate'):
            if validated_data.get('school') and validated_data['school'].governorate:
                validated_data['governorate'] = validated_data['school'].governorate
            elif user and getattr(user, 'governorate', None):
                validated_data['governorate'] = user.governorate
            else:
                validated_data['governorate'] = Governorate.objects.first()

        if self.instance:
            if not validated_data.get('school'):
                validated_data['school'] = self.instance.school
            if not validated_data.get('governorate'):
                validated_data['governorate'] = self.instance.governorate

        errors = {}
        if not validated_data.get('school'):
            errors['school'] = 'School/establishment must be provided (or linked via a class report).'
        if not validated_data.get('governorate'):
            errors['governorate'] = 'Governorate must be provided (or linked via a class report).'
        if errors:
            raise serializers.ValidationError(errors)

        return validated_data

    class Meta:
        model = QuestionnaireSession
        fields = [
            'id', 'school_class', 'class_report', 'school', 'school_id', 'establishment', 'governorate', 'governorate_id',
            'language_used', 'created_at',
            'tobacco_user', 'ecig_user', 'hookah_user', 'alcohol_user', 'tranquilizer_user',
            'cannabis_user', 'cocaine_user', 'ecstasy_user', 'heroin_user', 'inhalant_user',
            'has_risk_behavior', 'is_valid', 'exclusion_reason',
            'section_a', 'section_b', 'section_c', 'section_d', 'section_e',
            'section_g', 'section_h', 'section_i', 'section_j', 'section_k',
            'section_l', 'section_m', 'section_n', 'section_p', 'section_q',
            'section_r', 'section_s', 'section_t', 'section_u', 'section_v', 'section_z',
            'extra_answers', 'answers'
        ]
        read_only_fields = (
            'id', 'created_at', 'school', 'governorate',
            'tobacco_user', 'ecig_user', 'hookah_user', 'alcohol_user', 'tranquilizer_user',
            'cannabis_user', 'cocaine_user', 'ecstasy_user', 'heroin_user', 'inhalant_user',
            'has_risk_behavior',
        )

    def update(self, instance, validated_data):
        from django.db import transaction
        sections_data = {key: validated_data.pop(key, None) for key in SECTION_MAP}
        
        with transaction.atomic():
            # Update main session fields
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            
            # Update sections
            updated_sections_data = {}
            for section_key, section_data in sections_data.items():
                section_instance = getattr(instance, section_key, None)
                if section_data:
                    if section_instance:
                        for attr, value in section_data.items():
                            setattr(section_instance, attr, value)
                        section_instance.save()
                        # Get full data for recalculation
                        from django.forms.models import model_to_dict
                        updated_sections_data[section_key] = model_to_dict(section_instance)
                    else:
                        # If section doesn't exist, create it
                        new_sec = SECTION_MODEL_MAP[section_key].objects.create(session=instance, **section_data)
                        updated_sections_data[section_key] = section_data
                elif section_instance:
                    from django.forms.models import model_to_dict
                    updated_sections_data[section_key] = model_to_dict(section_instance)

            # --- Recalculate Logic ---
            def used(section_data, field='lifetime_freq'):
                if not section_data: return False
                val = section_data.get(field, '1')
                return val is not None and val != '1' and val != ''

            tobacco_user = used(updated_sections_data.get('section_c'))
            ecig_user = used(updated_sections_data.get('section_d'))
            hookah_user = used(updated_sections_data.get('section_e'))
            alcohol_user = used(updated_sections_data.get('section_g'))
            tranquilizer_user = used(updated_sections_data.get('section_h'))
            cannabis_user = used(updated_sections_data.get('section_i'))
            cocaine_user = used(updated_sections_data.get('section_j'))
            ecstasy_user = used(updated_sections_data.get('section_k'))
            heroin_user = used(updated_sections_data.get('section_l'))
            inhalant_user = used(updated_sections_data.get('section_m'))
            
            instance.tobacco_user = tobacco_user
            instance.ecig_user = ecig_user
            instance.hookah_user = hookah_user
            instance.alcohol_user = alcohol_user
            instance.tranquilizer_user = tranquilizer_user
            instance.cannabis_user = cannabis_user
            instance.cocaine_user = cocaine_user
            instance.ecstasy_user = ecstasy_user
            instance.heroin_user = heroin_user
            instance.inhalant_user = inhalant_user
            instance.has_risk_behavior = any([
                tobacco_user, ecig_user, hookah_user, alcohol_user,
                tranquilizer_user, cannabis_user, cocaine_user,
                ecstasy_user, heroin_user, inhalant_user,
            ])
            
            # Validation recalculation: respect explicit manual toggle if provided in payload
            if 'is_valid' in validated_data:
                instance.is_valid = validated_data['is_valid']
                if 'exclusion_reason' in validated_data:
                    instance.exclusion_reason = validated_data['exclusion_reason']
                elif not instance.is_valid and not instance.exclusion_reason:
                    instance.exclusion_reason = "Exclu manuellement (non comptabilisé)"
                elif instance.is_valid:
                    instance.exclusion_reason = None
            else:
                is_valid = True
                exclusion_reasons = []
                section_a_data = updated_sections_data.get('section_a') or {}
                gender = section_a_data.get('gender')
                if not gender or str(gender).strip() in ['', 'null', 'none']:
                    is_valid = False
                    exclusion_reasons.append("Genre non précisé")
                    
                birth_year = section_a_data.get('birth_year')
                if birth_year:
                    try:
                        birth_year_int = int(birth_year)
                        age = 2026 - birth_year_int
                        if age < 12 or age > 21:
                            is_valid = False
                            exclusion_reasons.append(f"Âge hors limites ({age} ans)")
                    except (ValueError, TypeError):
                        pass
                
                instance.is_valid = is_valid
                instance.exclusion_reason = " | ".join(exclusion_reasons) if not is_valid else None
            
            instance.save()
            
        return instance

    def create(self, validated_data):
        from django.db import transaction

        # Derive school and governorate from school_class or class_report
        school_class = validated_data.get('school_class')
        class_report = validated_data.get('class_report')
        
        if school_class:
            validated_data['school'] = school_class.establishment
            validated_data['governorate'] = school_class.establishment.governorate
        elif class_report:
            if not class_report.establishment and class_report.establishment_name and class_report.governorate:
                name = class_report.establishment_name.strip()
                if name:
                    est = SchoolEstablishment.objects.filter(name__iexact=name, governorate=class_report.governorate).first()
                    if not est:
                        est = SchoolEstablishment.objects.create(name=name, governorate=class_report.governorate)
                    class_report.establishment = est
                    class_report.save(update_fields=['establishment'])

            if class_report.establishment:
                validated_data['school'] = class_report.establishment
            if class_report.governorate:
                validated_data['governorate'] = class_report.governorate
        elif validated_data.get('school') and not validated_data.get('governorate'):
            school = validated_data['school']
            if school.governorate:
                validated_data['governorate'] = school.governorate

        errors = {}
        if not validated_data.get('school'):
            errors['school'] = 'School/establishment must be provided (or linked via a class report).'
        if not validated_data.get('governorate'):
            errors['governorate'] = 'Governorate must be provided (or linked via a class report).'
        if errors:
            raise serializers.ValidationError(errors)
        
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
                val = section_data.get(field, '1')
                return val is not None and val != '1' and val != ''

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
            section_a_data = sections_data.get('section_a') or {}
            gender = section_a_data.get('gender')
            if not gender or str(gender).strip() in ['', 'null', 'none']:
                is_valid = False
                exclusion_reasons.append("Genre non précisé")
                
            # 2. Age hors limites
            birth_year = section_a_data.get('birth_year')
            if birth_year:
                try:
                    birth_year_int = int(birth_year)
                    age = 2026 - birth_year_int
                    if age < 12 or age > 21:
                        is_valid = False
                        exclusion_reasons.append(f"Âge hors limites ({age} ans)")
                except (ValueError, TypeError):
                    pass
            
            # 3. Taux de valeurs manquantes par questionnaire
            total_fields = 0
            missing_fields = 0
            
            for sec_key, sec_data in sections_data.items():
                if sec_data and any(v not in [None, '', [], {}] for v in sec_data.values()):
                    total_fields += len(sec_data.keys())
                    missing_fields += sum(1 for v in sec_data.values() if v in [None, '', [], {}])
            
            if total_fields >= 10 and (missing_fields / total_fields) > 0.8:
                is_valid = False
                exclusion_reasons.append(f"Valeurs manquantes > 80% ({missing_fields}/{total_fields})")
            
            # 4. Consommation de substance fictive (Section P / Question piège)
            section_p_data = sections_data.get('section_p') or {}
            fictive_substance = section_p_data.get('fictive_substance_consumption')
            if fictive_substance in ['1', 'yes', True]: # '1' or 'yes' is 'Oui' in YES_NO
                is_valid = False
                exclusion_reasons.append("Consommation de substance fictive déclarée (Question piège)")

            # Auto-fill school and governorate from class_report if missing
            if 'class_report' in validated_data and validated_data['class_report']:
                report = validated_data['class_report']
                if not validated_data.get('school'):
                    validated_data['school'] = report.establishment
                if not validated_data.get('governorate'):
                    validated_data['governorate'] = report.governorate

            extra_answers = validated_data.pop('extra_answers', {})
            validated_data.pop('answers', None)
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
                extra_answers=extra_answers
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
