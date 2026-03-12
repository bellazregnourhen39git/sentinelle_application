from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _

class Governorate(models.Model):
    name = models.CharField(max_length=100, unique=True)
    
    def __str__(self):
        return self.name

class SchoolEstablishment(models.Model):
    name = models.CharField(max_length=200)
    governorate = models.ForeignKey(Governorate, on_delete=models.CASCADE, related_name='establishments')
    
    def __str__(self):
        return f"{self.name} ({self.governorate.name})"

class SchoolClass(models.Model):
    name = models.CharField(max_length=100)
    establishment = models.ForeignKey(SchoolEstablishment, on_delete=models.CASCADE, related_name='classes')
    
    def __str__(self):
        return f"{self.name} - {self.establishment.name}"

class User(AbstractUser):
    class Role(models.TextChoices):
        USER = 'USER', _('User (Doctor)')
        ADMIN = 'ADMIN', _('Admin (Governorate)')
        SUPERADMIN = 'SUPERADMIN', _('Super Admin (National)')

    role = models.CharField(max_length=20, choices=Role.choices, default=Role.USER)
    
    # Optional relationships based on role
    establishment = models.ForeignKey(SchoolEstablishment, on_delete=models.SET_NULL, null=True, blank=True, help_text="For USER role (Doctor)")
    governorate = models.ForeignKey(Governorate, on_delete=models.SET_NULL, null=True, blank=True, help_text="For ADMIN role (Governorate level)")

    def __str__(self):
        return f"{self.username} ({self.role})"

    def clean(self):
        super().clean()
        # Add basic validation logic if necessary, e.g., USER must have an establishment.

class MedSPADQuestionnaireResponse(models.Model):
    class Language(models.TextChoices):
        FR = 'FR', 'French'
        AR = 'AR', 'Arabic'

    school_class = models.ForeignKey(SchoolClass, on_delete=models.CASCADE, related_name='responses')
    school = models.ForeignKey(SchoolEstablishment, on_delete=models.CASCADE, related_name='responses')
    governorate = models.ForeignKey(Governorate, on_delete=models.CASCADE, related_name='responses')
    
    language_used = models.CharField(max_length=2, choices=Language.choices, default=Language.FR)
    created_at = models.DateTimeField(auto_now_add=True)
    
    # Store the entire form submission here
    answers = models.JSONField(help_text="Raw questionnaire answers stored as JSON")

    # High-level aggregated flags/metrics for dashboard performance
    tobacco_user = models.BooleanField(default=False)
    alcohol_user = models.BooleanField(default=False)
    cannabis_user = models.BooleanField(default=False)
    cocaine_user = models.BooleanField(default=False)
    ecstasy_user = models.BooleanField(default=False)
    has_risk_behavior = models.BooleanField(default=False)

    def __str__(self):
        return f"Response {self.id} | Class: {self.school_class.name} | Date: {self.created_at.date()}"
