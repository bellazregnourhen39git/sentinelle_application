from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from .models import Governorate, SchoolEstablishment, SchoolClass

User = get_user_model()

class SentinelleAPITests(APITestCase):
    def setUp(self):
        # Create Governorate, School, Class
        self.gov = Governorate.objects.create(name="Tunis")
        self.school = SchoolEstablishment.objects.create(name="Lycée Pilote", governorate=self.gov)
        self.school_class = SchoolClass.objects.create(name="Terminal Math 1", establishment=self.school)

        # Create Users
        self.user = User.objects.create_user(username='doc_tunis', password='password123', role='USER', establishment=self.school)
        self.admin = User.objects.create_user(username='admin_tunis', password='password123', role='ADMIN', governorate=self.gov)
        self.superadmin = User.objects.create_user(username='super_admin', password='password123', role='SUPERADMIN')

    def test_login_and_role_access(self):
        # Test Login
        response = self.client.post(reverse('token_obtain_pair'), {'username': 'doc_tunis', 'password': 'password123'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        token = response.data['access']
        
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + token)
        
        # A USER should be able to access school stats
        res_school = self.client.get(reverse('stats_school'))
        self.assertEqual(res_school.status_code, status.HTTP_200_OK)
        
        # A USER should NOT be able to access governorate stats
        res_gov = self.client.get(reverse('stats_governorate'))
        self.assertEqual(res_gov.status_code, status.HTTP_403_FORBIDDEN)

    def test_questionnaire_submission(self):
        self.client.force_authenticate(user=self.user)
        payload = {
            "school_class": self.school_class.id,
            "school": self.school.id,
            "governorate": self.gov.id,
            "language_used": "AR",
            "answers": {"tobacco_30days": "1-5 par jour"},
            "tobacco_user": True,
            "alcohol_user": False,
            "cannabis_user": False,
            "cocaine_user": False,
            "ecstasy_user": False,
            "has_risk_behavior": True
        }
        res = self.client.post(reverse('questionnaire_submit'), payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

        # Check that it reflects in stats
        res_stats = self.client.get(reverse('stats_school'))
        self.assertEqual(res_stats.data['total_responses'], 1)
        self.assertEqual(res_stats.data['tobacco_users'], 1)

    def test_sidra_export(self):
        self.client.force_authenticate(user=self.superadmin)
        res = self.client.get(reverse('sidra_export'))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('survey_source', res.data)
