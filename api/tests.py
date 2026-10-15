from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from .models import Governorate, SchoolEstablishment, SchoolClass, QuestionnaireSession, ClassReport
from .analytics import SentinelleAnalytics

User = get_user_model()

class SentinelleAPITests(APITestCase):
    def setUp(self):
        # Create Governorate, School, Class
        self.gov, _ = Governorate.objects.get_or_create(name="Tunis")
        self.school, _ = SchoolEstablishment.objects.get_or_create(name="Lycée Pilote", governorate=self.gov)
        self.school_class, _ = SchoolClass.objects.get_or_create(name="Terminal Math 1", establishment=self.school)

        # Create Users
        self.user = User.objects.create_user(username='doc_tunis', email='doc@example.com', password='password123', role='PRACTITIONER', establishment=self.school)
        self.admin = User.objects.create_user(username='admin_tunis', email='admin@example.com', password='password123', role='REGIONAL_ADMIN', governorate=self.gov)
        self.superadmin = User.objects.create_user(username='super_admin', email='super@example.com', password='password123', role='SUPER_ADMIN')

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
            "section_a": {"gender": "M", "birth_year": 2008},
            "section_c": {"lifetime_freq": "2"},
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

    def test_questionnaire_submission_with_class_report(self):
        self.client.force_authenticate(user=self.user)
        report = ClassReport.objects.create(
            governorate=self.gov,
            establishment=self.school,
            establishment_name="Lycée Pilote",
            study_level="1_AS",
            report_date="2026-07-27"
        )
        payload = {
            "class_report": report.id,
            "language_used": "FR",
            "section_a": {"gender": "M", "birth_year": "2008"},
            "section_c": {"lifetime_freq": "2"},
        }
        res = self.client.post(reverse('questionnaire_submit'), payload, format='json')
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data['class_report'], report.id)

    def test_sidra_export(self):
        self.client.force_authenticate(user=self.superadmin)
        res = self.client.get(reverse('sidra_export'))
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('survey_source', res.data)

    def test_homepage_stats_return_no_data_when_no_submissions_exist(self):
        empty_qs = QuestionnaireSession.objects.none()
        stats = SentinelleAnalytics.get_homepage_stats(empty_qs, 'Tunis')

        self.assertEqual(stats['headline']['n_submissions'], 0)
        self.assertIsNone(stats['global_insights']['comorbidity']['poly_2plus_pct'])
        self.assertIsNone(stats['global_insights']['comorbidity']['poly_3plus_pct'])
        self.assertEqual(stats['group_prevalence'], [])
        self.assertEqual(stats['top_sections'], [])

    def test_practitioner_multi_establishment_class_reports(self):
        # Practitioner can create reports for different establishments
        gov_ariana, _ = Governorate.objects.get_or_create(name="Ariana")
        school_b, _ = SchoolEstablishment.objects.get_or_create(name="Lycée Ariana", governorate=gov_ariana)
        
        self.client.force_authenticate(user=self.user)
        
        # Report 1 for school A (Tunis)
        r1_payload = {
            "governorate": self.gov.id,
            "establishment": self.school.id,
            "establishment_name": "Lycée Pilote Tunis",
            "study_level": "1_AS",
            "report_date": "2026-08-10",
            "students_present": 25,
            "questionnaires_collected": 25
        }
        res1 = self.client.post(reverse('class_report_create'), r1_payload, format='json')
        self.assertEqual(res1.status_code, status.HTTP_201_CREATED)
        r1_id = res1.data['id']
        
        # Report 2 for school B (Ariana)
        r2_payload = {
            "governorate": gov_ariana.id,
            "establishment": school_b.id,
            "establishment_name": "Lycée Ariana",
            "study_level": "2_AS",
            "report_date": "2026-08-11",
            "students_present": 30,
            "questionnaires_collected": 28
        }
        res2 = self.client.post(reverse('class_report_create'), r2_payload, format='json')
        self.assertEqual(res2.status_code, status.HTTP_201_CREATED)
        r2_id = res2.data['id']
        
        # Check active reports list
        res_active = self.client.get(reverse('class_report_list') + '?is_finalized=false')
        self.assertEqual(res_active.status_code, status.HTTP_200_OK)
        active_ids = [r['id'] for r in res_active.data]
        self.assertIn(r1_id, active_ids)
        self.assertIn(r2_id, active_ids)
        
        # Practitioner can update (PATCH) their own report
        res_patch = self.client.patch(reverse('class_report_detail', kwargs={'pk': r1_id}), {'students_absent': 2}, format='json')
        self.assertEqual(res_patch.status_code, status.HTTP_200_OK)
        self.assertEqual(res_patch.data['students_absent'], 2)
        
        # Finalize report 1
        res_fin = self.client.post(reverse('class_report_finalize', kwargs={'pk': r1_id}))
        self.assertEqual(res_fin.status_code, status.HTTP_200_OK)
        
        # Now only report 2 is active
        res_active2 = self.client.get(reverse('class_report_list') + '?is_finalized=false')
        active_ids2 = [r['id'] for r in res_active2.data]
        self.assertNotIn(r1_id, active_ids2)
        self.assertIn(r2_id, active_ids2)

    def test_class_report_strict_user_isolation_and_superadmin_management(self):
        # 1. Practitioner creates a class report
        self.client.force_authenticate(user=self.user)
        payload = {
            "governorate": self.gov.id,
            "establishment": self.school.id,
            "establishment_name": "Lycée Pilote Tunis",
            "study_level": "1_AS",
            "report_date": "2026-08-11",
            "students_present": 20,
            "questionnaires_collected": 20
        }
        res_create = self.client.post(reverse('class_report_create'), payload, format='json')
        self.assertEqual(res_create.status_code, status.HTTP_201_CREATED)
        prac_report_id = res_create.data['id']

        # Practitioner sees it in their own list
        res_prac_list = self.client.get(reverse('class_report_list'))
        self.assertEqual(res_prac_list.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res_prac_list.data), 1)
        self.assertEqual(res_prac_list.data[0]['id'], prac_report_id)

        # 2. Superadmin logs in
        self.client.force_authenticate(user=self.superadmin)

        # Superadmin default list only shows superadmin's own reports (isolated)
        res_admin_list = self.client.get(reverse('class_report_list'))
        self.assertEqual(res_admin_list.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res_admin_list.data), 0)

        # Superadmin CAN inspect this specific user's reports in User Management
        res_user_reports = self.client.get(reverse('class_report_list') + f'?user_id={self.user.id}')
        self.assertEqual(res_user_reports.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res_user_reports.data), 1)
        self.assertEqual(res_user_reports.data[0]['id'], prac_report_id)

        # Superadmin can retrieve and modify this report
        res_detail = self.client.get(reverse('class_report_detail', kwargs={'pk': prac_report_id}))
        self.assertEqual(res_detail.status_code, status.HTTP_200_OK)
        self.assertEqual(res_detail.data['id'], prac_report_id)

        res_patch = self.client.patch(reverse('class_report_detail', kwargs={'pk': prac_report_id}), {'students_absent': 3}, format='json')
        self.assertEqual(res_patch.status_code, status.HTTP_200_OK)
        self.assertEqual(res_patch.data['students_absent'], 3)

        # Superadmin can finalize and reopen this report
        res_fin = self.client.post(reverse('class_report_finalize', kwargs={'pk': prac_report_id}))
        self.assertEqual(res_fin.status_code, status.HTTP_200_OK)
        self.assertTrue(res_fin.data['is_finalized'])

        res_reopen = self.client.post(reverse('class_report_finalize', kwargs={'pk': prac_report_id}), {'action': 'unfinalize'})
        self.assertEqual(res_reopen.status_code, status.HTTP_200_OK)
        self.assertFalse(res_reopen.data['is_finalized'])


